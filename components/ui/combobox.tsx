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

export interface ComboboxItem {
  value: string;
  label: string;
  icon?: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  description?: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  selectedValues: Set<string>;
  onToggle: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  renderTrigger?: (props: {
    selectedCount: number;
    totalCount: number;
    selectedItems: ComboboxItem[];
  }) => React.ReactNode;
  renderItem?: (item: ComboboxItem, isSelected: boolean) => React.ReactNode;
  className?: string;
}

export function Combobox({
  items,
  selectedValues,
  onToggle,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  renderTrigger,
  renderItem,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCount = selectedValues.size;
  const totalCount = items.length;
  const selectedItems = items.filter((item) => selectedValues.has(item.value));

  const defaultTriggerContent = () => {
    if (selectedCount === 0) return placeholder;
    if (selectedCount === totalCount) return "All selected";
    return `${selectedCount} selected`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button
            {...props}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={`${selectedCount} of ${totalCount} selected`}
            className={cn("w-full justify-between", className)}
          >
            {renderTrigger ? (
              renderTrigger({ selectedCount, totalCount, selectedItems })
            ) : (
              <span className="truncate">{defaultTriggerContent()}</span>
            )}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      />
      <PopoverContent className="p-0" sideOffset={4} matchTriggerWidth>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const isSelected = selectedValues.has(item.value);

                return (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => onToggle(item.value)}
                    className="flex items-center gap-2"
                  >
                    {renderItem ? (
                      renderItem(item, isSelected)
                    ) : (
                      <>
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
                        {item.icon && (
                          <item.icon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
