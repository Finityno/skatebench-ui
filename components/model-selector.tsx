"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProviderIconByModelName } from "@/lib/provider-icons";

interface ModelData {
  model: string;
  successRate: number;
}

interface ModelSelectorProps {
  models: ModelData[];
  selectedModels: Set<string>;
  onToggleModel: (model: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectTop10: () => void;
  getModelColor: (index: number) => string;
  showPercentages?: boolean;
  mode?: "list" | "command";
}

// Get unique provider icons from selected models
function getUniqueProviderIcons(
  selectedModels: Set<string>,
  models: ModelData[],
) {
  const providers = new Map<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >();

  for (const model of models) {
    if (selectedModels.has(model.model)) {
      const Icon = getProviderIconByModelName(model.model);
      if (Icon) {
        const iconName =
          Icon.displayName || Icon.name || model.model.split("-")[0];
        if (!providers.has(iconName)) {
          providers.set(iconName, Icon);
        }
      }
    }
  }

  return Array.from(providers.values());
}

function QuickSelectBadges({
  onSelectAll,
  onSelectNone,
  onSelectTop10,
}: {
  onSelectAll: () => void;
  onSelectNone: () => void;
  onSelectTop10: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={onSelectAll}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectAll();
          }
        }}
      >
        All
      </Badge>
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={onSelectNone}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectNone();
          }
        }}
      >
        None
      </Badge>
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={onSelectTop10}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectTop10();
          }
        }}
      >
        Top 10
      </Badge>
    </div>
  );
}

function CommandModeSelector({
  models,
  selectedModels,
  onToggleModel,
  onSelectAll,
  onSelectNone,
  onSelectTop10,
  getModelColor,
  showPercentages = true,
}: Omit<ModelSelectorProps, "mode">) {
  const [open, setOpen] = React.useState(false);

  const selectedCount = selectedModels.size;
  const totalCount = models.length;

  const uniqueProviderIcons = React.useMemo(
    () => getUniqueProviderIcons(selectedModels, models),
    [selectedModels, models],
  );

  const maxDisplayedIcons = 4;
  const displayedIcons = uniqueProviderIcons.slice(0, maxDisplayedIcons);
  const remainingIconsCount = uniqueProviderIcons.length - maxDisplayedIcons;

  return (
    <div className="space-y-3">
      <QuickSelectBadges
        onSelectAll={onSelectAll}
        onSelectNone={onSelectNone}
        onSelectTop10={onSelectTop10}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={(props) => (
            <Button
              {...props}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label={`Select models. ${selectedCount} of ${totalCount} selected`}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {selectedCount > 0 && displayedIcons.length > 0 && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {displayedIcons.map((Icon, idx) => (
                      <Icon key={idx} className="h-4 w-4 opacity-70" />
                    ))}
                    {remainingIconsCount > 0 && (
                      <span className="text-xs text-muted-foreground ml-0.5">
                        +{remainingIconsCount}
                      </span>
                    )}
                  </div>
                )}
                <span className="truncate text-left">
                  {selectedCount === 0
                    ? "Select models..."
                    : selectedCount === totalCount
                      ? "All models"
                      : `${selectedCount} model${selectedCount === 1 ? "" : "s"}`}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        />
        <PopoverContent
          className="w-[--anchor-width] min-w-[--anchor-width] p-0"
          sideOffset={4}
        >
          <Command className="w-full">
            <CommandInput placeholder="Search models..." />
            <CommandList className="max-h-[300px] w-full">
              <CommandEmpty className="py-6 text-center text-sm">
                No model found.
              </CommandEmpty>
              <CommandGroup>
                {models.map((item) => {
                  const isSelected = selectedModels.has(item.model);
                  const ProviderIcon = getProviderIconByModelName(item.model);
                  const colorIndex = models.findIndex(
                    (m) => m.model === item.model,
                  );

                  return (
                    <CommandItem
                      key={item.model}
                      value={item.model}
                      onSelect={() => onToggleModel(item.model)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/50 opacity-50",
                        )}
                      >
                        {isSelected && (
                          <CheckIcon className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      {ProviderIcon ? (
                        <ProviderIcon className="h-4 w-4 shrink-0" />
                      ) : (
                        <div
                          className="h-4 w-4 rounded-full shrink-0"
                          style={{
                            backgroundColor: getModelColor(colorIndex),
                          }}
                        />
                      )}
                      <span className="flex-1 truncate">{item.model}</span>
                      {showPercentages && (
                        <span className="text-xs text-muted-foreground">
                          {item.successRate.toFixed(1)}%
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="text-sm text-muted-foreground">
        {selectedCount} of {totalCount} models selected
      </div>
    </div>
  );
}

function ListModeSelector({
  models,
  selectedModels,
  onToggleModel,
  onSelectAll,
  onSelectNone,
  onSelectTop10,
  getModelColor,
  showPercentages = true,
}: Omit<ModelSelectorProps, "mode">) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const filteredModelList = React.useMemo(() => {
    if (!searchQuery.trim()) return models;
    const query = searchQuery.toLowerCase();
    return models.filter((item) => item.model.toLowerCase().includes(query));
  }, [searchQuery, models]);

  // Scroll focused item into view
  React.useEffect(() => {
    if (focusedIndex >= 0) {
      const focusedElement = document.getElementById(
        `model-option-${filteredModelList[focusedIndex]?.model}`,
      );
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusedIndex, filteredModelList]);

  return (
    <>
      <QuickSelectBadges
        onSelectAll={onSelectAll}
        onSelectNone={onSelectNone}
        onSelectTop10={onSelectTop10}
      />
      <input
        type="text"
        placeholder="Search models..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setFocusedIndex(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) => {
              if (prev < 0) return 0;
              return prev < filteredModelList.length - 1 ? prev + 1 : prev;
            });
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => {
              if (prev < 0) return filteredModelList.length - 1;
              return prev > 0 ? prev - 1 : prev;
            });
          } else if (e.key === "Enter" && focusedIndex >= 0) {
            e.preventDefault();
            const item = filteredModelList[focusedIndex];
            if (item) onToggleModel(item.model);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setFocusedIndex(-1);
            (e.target as HTMLInputElement).blur();
          }
        }}
        aria-label="Search models"
        aria-activedescendant={
          focusedIndex >= 0
            ? `model-option-${filteredModelList[focusedIndex]?.model}`
            : undefined
        }
        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      />
      <div className="relative" role="listbox" aria-label="Model list">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card to-transparent pointer-events-none z-10 rounded-t-md" />
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none z-10 rounded-b-md" />
        <ScrollArea className="h-[360px] xl:h-[560px]">
          <div className="space-y-0.5 px-1 py-2">
            {filteredModelList.map((item, idx) => {
              const index = models.findIndex((b) => b.model === item.model);
              const ProviderIcon = getProviderIconByModelName(item.model);
              const isFocused = focusedIndex === idx;
              return (
                <div
                  key={item.model}
                  id={`model-option-${item.model}`}
                  className="flex items-center gap-3 py-1.5 px-1 rounded-md cursor-pointer transition-colors hover:bg-muted data-[focused=true]:bg-accent data-[focused=true]:text-accent-foreground"
                  data-focused={isFocused}
                  role="option"
                  aria-selected={selectedModels.has(item.model)}
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleModel(item.model);
                  }}
                >
                  <Checkbox
                    checked={selectedModels.has(item.model)}
                    onCheckedChange={() => onToggleModel(item.model)}
                    tabIndex={-1}
                  />
                  {ProviderIcon ? (
                    <ProviderIcon className="w-4 h-4 flex-shrink-0 pointer-events-none" />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 pointer-events-none"
                      style={{
                        backgroundColor: getModelColor(index),
                      }}
                    />
                  )}
                  <span className="text-sm flex-1 truncate pointer-events-none">
                    {item.model}
                  </span>
                  {showPercentages && (
                    <span className="text-xs text-muted-foreground">
                      {item.successRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

export function ModelSelector({ mode = "list", ...props }: ModelSelectorProps) {
  if (mode === "command") {
    return <CommandModeSelector {...props} />;
  }
  return <ListModeSelector {...props} />;
}

export { QuickSelectBadges };
