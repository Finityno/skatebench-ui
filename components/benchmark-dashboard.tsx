"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ReferenceArea,
  Label,
  Cell,
  LabelList,
  ZAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelSelector } from "@/components/model-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Frame,
  FramePanel,
  FrameHeader,
  FrameTitle,
  FrameDescription,
} from "@/components/ui/frame";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviderIconByModelName } from "@/lib/provider-icons";
import OpenAIIcon from "@/components/icons/providers/openai";
import ClaudeIcon from "@/components/icons/providers/claude";
import GeminiIcon from "@/components/icons/providers/gemini";
import DeepSeekIcon from "@/components/icons/providers/deepseek";
import GrokIcon from "@/components/icons/providers/grok";
import QwenIcon from "@/components/icons/providers/qwen";
import KimiIcon from "@/components/icons/providers/kimi";
import ZAIIcon from "@/components/icons/providers/zai";
import benchmarkResults from "@/data/benchmark-results.json";

const benchmarkData = benchmarkResults.rankings;

const MODEL_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f97316", // orange
  "#eab308", // yellow
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ef4444", // red
  "#84cc16", // lime
  "#f59e0b", // amber
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#d946ef", // fuchsia
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#a855f7", // violet
  "#f43f5e", // rose
  "#64748b", // slate
  "#78716c", // stone
  "#71717a", // zinc
];

const getModelColor = (index: number): string => {
  return MODEL_COLORS[index % MODEL_COLORS.length];
};

const getLongestModelNameLength = (data: { model: string }[]): number => {
  return Math.max(...data.map((d) => d.model.length));
};

function CustomBarTooltip({
  active,
  payload,
  valueLabel,
  valueSuffix,
  valueKey,
}: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card text-card-foreground border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{data.model}</p>
        <p className="text-sm text-muted-foreground">
          {valueLabel}:{" "}
          {typeof payload[0].value === "number"
            ? payload[0].value.toFixed(2)
            : payload[0].value}
          {valueSuffix}
        </p>
      </div>
    );
  }
  return null;
}

// Custom Y-axis tick with provider icon
function CustomYAxisTick({ x, y, payload, showIcon = true }: any) {
  const ProviderIcon = showIcon
    ? getProviderIconByModelName(payload.value)
    : null;
  const iconSize = 14;
  const iconMargin = 6;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={ProviderIcon ? -iconSize - iconMargin : -5}
        y={0}
        dy={4}
        textAnchor="end"
        fill="currentColor"
        fontSize={11}
        className="fill-foreground"
      >
        {payload.value}
      </text>
      {ProviderIcon && (
        <foreignObject
          x={-iconSize}
          y={-iconSize / 2}
          width={iconSize}
          height={iconSize}
          style={{ overflow: "visible" }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <ProviderIcon
              className="w-3.5 h-3.5"
              style={{ color: "currentColor" }}
            />
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// Custom scatter shape that renders provider icons
function CustomScatterShape(props: any) {
  const { cx, cy, payload } = props;
  const ProviderIcon = getProviderIconByModelName(payload.model);

  if (!ProviderIcon) {
    // Fallback to circle if no icon
    return (
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={payload.color}
        style={{ cursor: "crosshair" }}
      />
    );
  }

  return (
    <foreignObject
      x={cx - 10}
      y={cy - 10}
      width={20}
      height={20}
      style={{ cursor: "crosshair", overflow: "visible" }}
    >
      <div className="flex items-center justify-center w-full h-full">
        <ProviderIcon className="w-5 h-5" style={{ color: payload.color }} />
      </div>
    </foreignObject>
  );
}

const STORAGE_KEY = "skatebench-selected-models";
const STORAGE_KEY_HORIZONTAL = "skatebench-is-horizontal";
const STORAGE_KEY_COMMAND_SELECTOR = "skatebench-use-command-selector";
const STORAGE_KEY_SHOW_PERCENTAGES = "skatebench-show-percentages";
const STORAGE_KEY_SIDEBAR_COLLAPSED = "skatebench-sidebar-collapsed";

// Helper to safely read from localStorage
function getStorageItem<T>(
  key: string,
  defaultValue: T,
  parser?: (val: string) => T,
): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    if (parser) return parser(saved);
    return saved as unknown as T;
  } catch {
    return defaultValue;
  }
}

// Helper to safely write to localStorage
function setStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  } catch {
    // Ignore localStorage errors
  }
}

export { BenchmarkDashboard };
export default function BenchmarkDashboard() {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(() => {
    const saved = getStorageItem<string[] | null>(STORAGE_KEY, null, (val) => {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    });
    return saved
      ? new Set(saved)
      : new Set(benchmarkData.slice(0, 10).map((d) => d.model));
  });
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(() =>
    getStorageItem(STORAGE_KEY_HORIZONTAL, true, (val) => val === "true"),
  );

  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [useCommandSelector, setUseCommandSelector] = useState(() =>
    getStorageItem(
      STORAGE_KEY_COMMAND_SELECTOR,
      false,
      (val) => val === "true",
    ),
  );
  const [showPercentages, setShowPercentages] = useState(() =>
    getStorageItem(STORAGE_KEY_SHOW_PERCENTAGES, true, (val) => val === "true"),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    getStorageItem(
      STORAGE_KEY_SIDEBAR_COLLAPSED,
      false,
      (val) => val === "true",
    ),
  );

  // Handle resize on mount
  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (!isClient) return;
    setStorageItem(STORAGE_KEY, [...selectedModels]);
  }, [selectedModels, isClient]);

  useEffect(() => {
    if (!isClient) return;
    setStorageItem(STORAGE_KEY_HORIZONTAL, String(isHorizontal));
  }, [isHorizontal, isClient]);

  useEffect(() => {
    if (!isClient) return;
    setStorageItem(STORAGE_KEY_COMMAND_SELECTOR, String(useCommandSelector));
  }, [useCommandSelector, isClient]);

  useEffect(() => {
    if (!isClient) return;
    setStorageItem(STORAGE_KEY_SHOW_PERCENTAGES, String(showPercentages));
  }, [showPercentages, isClient]);

  useEffect(() => {
    if (!isClient) return;
    setStorageItem(STORAGE_KEY_SIDEBAR_COLLAPSED, String(sidebarCollapsed));
  }, [sidebarCollapsed, isClient]);

  const [zoomArea, setZoomArea] = useState<{
    x1: number | null;
    y1: number | null;
    x2: number | null;
    y2: number | null;
  }>({ x1: null, y1: null, x2: null, y2: null });
  const [zoomedDomain, setZoomedDomain] = useState<{
    x: [number, number] | null;
    y: [number, number] | null;
  }>({ x: null, y: null });
  const [isSelecting, setIsSelecting] = useState(false);

  const toggleModel = (model: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(model)) {
      newSelected.delete(model);
    } else {
      newSelected.add(model);
    }
    setSelectedModels(newSelected);
  };

  const selectAll = () => {
    setSelectedModels(new Set(benchmarkData.map((d) => d.model)));
  };

  const selectNone = () => {
    setSelectedModels(new Set());
  };

  const selectTop10 = () => {
    setSelectedModels(new Set(benchmarkData.slice(0, 10).map((d) => d.model)));
  };

  const filteredData = useMemo(() => {
    return benchmarkData.filter((d) => selectedModels.has(d.model));
  }, [selectedModels]);

  const chartHeight = useMemo(() => {
    const baseHeight = 400;
    const perModelHeight = 28;
    const minHeight = 300;
    const calculatedHeight = Math.max(
      minHeight,
      filteredData.length * perModelHeight + 60,
    );
    return Math.min(calculatedHeight, 800);
  }, [filteredData.length]);

  const successRateData = useMemo(() => {
    return filteredData
      .map((d) => ({
        ...d,
        color: getModelColor(
          benchmarkData.findIndex((b) => b.model === d.model),
        ),
      }))
      .sort((a, b) => b.successRate - a.successRate);
  }, [filteredData]);

  const costData = useMemo(() => {
    return filteredData
      .map((d) => ({
        ...d,
        costCents: d.averageCostPerTest * 100,
        color: getModelColor(
          benchmarkData.findIndex((b) => b.model === d.model),
        ),
      }))
      .sort((a, b) => a.costCents - b.costCents);
  }, [filteredData]);

  const speedData = useMemo(() => {
    return filteredData
      .map((d) => ({
        ...d,
        speedSeconds: d.averageDuration / 1000,
        color: getModelColor(
          benchmarkData.findIndex((b) => b.model === d.model),
        ),
      }))
      .sort((a, b) => a.speedSeconds - b.speedSeconds);
  }, [filteredData]);

  const yAxisWidth = useMemo(() => {
    const longest = getLongestModelNameLength(filteredData);
    // Smaller width on mobile
    if (isMobile) {
      return Math.max(100, Math.min(150, longest * 6 + 10));
    }
    return Math.max(150, Math.min(220, longest * 7 + 20));
  }, [filteredData, isMobile]);

  const { combinedData, defaultXDomain, defaultYDomain } = useMemo(() => {
    const data = filteredData.map((d) => ({
      ...d,
      x: d.totalCost,
      y: d.successRate,
      color: getModelColor(benchmarkData.findIndex((b) => b.model === d.model)),
    }));

    const costs = data.map((d) => d.x);
    const maxCost = Math.max(...costs);

    return {
      combinedData: data,
      defaultXDomain: [0, maxCost * 1.1] as [number, number],
      defaultYDomain: [0, 100] as [number, number],
    };
  }, [filteredData]);

  const xDomain = zoomedDomain.x || defaultXDomain;
  const yDomain = zoomedDomain.y || defaultYDomain;

  const handleMouseDown = useCallback((e: any) => {
    if (e && e.xValue !== undefined && e.yValue !== undefined) {
      setZoomArea({ x1: e.xValue, y1: e.yValue, x2: null, y2: null });
      setIsSelecting(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: any) => {
      if (
        isSelecting &&
        e &&
        e.xValue !== undefined &&
        e.yValue !== undefined
      ) {
        setZoomArea((prev) => ({ ...prev, x2: e.xValue, y2: e.yValue }));
      }
    },
    [isSelecting],
  );

  const handleMouseUp = useCallback(() => {
    if (
      isSelecting &&
      zoomArea.x1 !== null &&
      zoomArea.x2 !== null &&
      zoomArea.y1 !== null &&
      zoomArea.y2 !== null
    ) {
      const x1 = Math.min(zoomArea.x1, zoomArea.x2);
      const x2 = Math.max(zoomArea.x1, zoomArea.x2);
      const y1 = Math.min(zoomArea.y1, zoomArea.y2);
      const y2 = Math.max(zoomArea.y1, zoomArea.y2);

      if (x2 - x1 > 0.1 && y2 - y1 > 1) {
        setZoomedDomain({
          x: [x1, x2],
          y: [y1, y2],
        });
      }
    }
    setZoomArea({ x1: null, y1: null, x2: null, y2: null });
    setIsSelecting(false);
  }, [isSelecting, zoomArea]);

  const resetZoom = useCallback(() => {
    setZoomedDomain({ x: null, y: null });
  }, []);

  const isZoomed = zoomedDomain.x !== null || zoomedDomain.y !== null;

  // Show loading skeleton during SSR to prevent Base UI hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex gap-6">
            <Card className="hidden xl:block h-fit w-[280px] shrink-0">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="w-8 h-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex-1 min-w-0 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Model Benchmark Results
                  </h1>
                  <p className="text-muted-foreground">
                    Technical Trick Terminology Test Suite - 210 tests per model
                  </p>
                </div>
                <Skeleton className="w-9 h-9 rounded-md" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex gap-6">
          {/* Sidebar container with animation */}
          <div
            className={`hidden xl:block pt-[104px] shrink-0 transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? "w-[40px]" : "w-[280px]"
            }`}
          >
            <div className="sticky top-8">
              {/* Collapsed state */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  sidebarCollapsed
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 absolute pointer-events-none"
                }`}
              >
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="flex flex-col items-center gap-2 px-2 py-4 rounded-lg border border-border bg-card hover:bg-muted/50 dark:hover:bg-muted transition-colors"
                  aria-label="Open model selector"
                >
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={18}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                    Models
                  </span>
                </button>
              </div>

              {/* Expanded state */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  sidebarCollapsed
                    ? "opacity-0 scale-95 absolute pointer-events-none"
                    : "opacity-100 scale-100"
                }`}
              >
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <button
                      onClick={() => setSidebarCollapsed(true)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                      aria-label="Collapse model selector"
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        size={14}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      Collapse
                    </button>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Model Selector</CardTitle>
                      <div className="flex gap-1 items-center">
                        <Badge
                          variant={showPercentages ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => setShowPercentages(!showPercentages)}
                          tabIndex={0}
                          role="switch"
                          aria-checked={showPercentages}
                          aria-label="Show percentages"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setShowPercentages(!showPercentages);
                            }
                          }}
                        >
                          %
                        </Badge>
                        <Badge
                          variant={useCommandSelector ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() =>
                            setUseCommandSelector(!useCommandSelector)
                          }
                          tabIndex={0}
                          role="switch"
                          aria-checked={useCommandSelector}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setUseCommandSelector(!useCommandSelector);
                            }
                          }}
                        >
                          {useCommandSelector ? "Command" : "List"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {selectedModels.size} of {benchmarkData.length} models
                      selected
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ModelSelector
                      models={benchmarkData}
                      selectedModels={selectedModels}
                      onToggleModel={toggleModel}
                      onSelectAll={selectAll}
                      onSelectNone={selectNone}
                      onSelectTop10={selectTop10}
                      getModelColor={getModelColor}
                      showPercentages={showPercentages}
                      mode={useCommandSelector ? "command" : "list"}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Model Benchmark Results
                </h1>
                <p className="text-muted-foreground">
                  Technical Trick Terminology Test Suite - 210 tests per model
                </p>
              </div>
              <ThemeToggle />
            </div>

            {/* Mobile Model Selector */}
            <Card className="xl:hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Model Selector</CardTitle>
                  <div className="flex gap-1">
                    <Badge
                      variant={showPercentages ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setShowPercentages(!showPercentages)}
                      tabIndex={0}
                      role="switch"
                      aria-checked={showPercentages}
                      aria-label="Show percentages"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setShowPercentages(!showPercentages);
                        }
                      }}
                    >
                      %
                    </Badge>
                    <Badge
                      variant={useCommandSelector ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setUseCommandSelector(!useCommandSelector)}
                      tabIndex={0}
                      role="switch"
                      aria-checked={useCommandSelector}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setUseCommandSelector(!useCommandSelector);
                        }
                      }}
                    >
                      {useCommandSelector ? "Command" : "List"}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {selectedModels.size} of {benchmarkData.length} models
                  selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ModelSelector
                  models={benchmarkData}
                  selectedModels={selectedModels}
                  onToggleModel={toggleModel}
                  onSelectAll={selectAll}
                  onSelectNone={selectNone}
                  onSelectTop10={selectTop10}
                  getModelColor={getModelColor}
                  showPercentages={showPercentages}
                  mode={useCommandSelector ? "command" : "list"}
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="success-rate" className="w-full">
              <TabsList
                variant="line"
                className="mb-4 border-b border-border w-full justify-start"
              >
                <TabsTrigger value="success-rate">Success Rate</TabsTrigger>
                <TabsTrigger value="cost">Cost</TabsTrigger>
                <TabsTrigger value="speed">Speed</TabsTrigger>
                <TabsTrigger value="combined">Combined</TabsTrigger>
              </TabsList>

              {/* Success Rate Tab */}
              <TabsContent value="success-rate" className="mt-0">
                <Frame>
                  <FrameHeader>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <FrameTitle>Success Rate by Model</FrameTitle>
                        <FrameDescription>
                          Percentage of correct answers out of 210 tests per
                          model
                        </FrameDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={isHorizontal ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setIsHorizontal(true)}
                        >
                          Horizontal
                        </Badge>
                        <Badge
                          variant={!isHorizontal ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setIsHorizontal(false)}
                        >
                          Vertical
                        </Badge>
                      </div>
                    </div>
                  </FrameHeader>
                  <FramePanel>
                    <div style={{ height: isHorizontal ? chartHeight : 500 }}>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                      >
                        <BarChart
                          key={`success-${successRateData.length}`}
                          data={successRateData}
                          layout={isHorizontal ? "vertical" : "horizontal"}
                          margin={
                            isHorizontal
                              ? {
                                  top: 5,
                                  right: isMobile ? 10 : 30,
                                  left: isMobile ? 10 : yAxisWidth - 100,
                                  bottom: 5,
                                }
                              : { top: 20, right: 10, left: 10, bottom: 100 }
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={isHorizontal ? false : true}
                            vertical={isHorizontal ? true : false}
                          />
                          {isHorizontal ? (
                            <>
                              <XAxis type="number" domain={[0, 100]} unit="%" />
                              <YAxis
                                type="category"
                                dataKey="model"
                                width={yAxisWidth}
                                tick={<CustomYAxisTick showIcon={!isMobile} />}
                                tickLine={false}
                                interval={0}
                              />
                            </>
                          ) : (
                            <>
                              <XAxis
                                type="category"
                                dataKey="model"
                                tick={{
                                  fontSize: 10,
                                  angle: -45,
                                  textAnchor: "end",
                                }}
                                tickLine={false}
                                interval={0}
                                height={80}
                              />
                              <YAxis type="number" domain={[0, 100]} unit="%" />
                            </>
                          )}
                          <Tooltip
                            content={
                              <CustomBarTooltip
                                valueLabel="Success Rate"
                                valueSuffix="%"
                              />
                            }
                            cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                            isAnimationActive={false}
                          />
                          <Bar
                            dataKey="successRate"
                            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                          >
                            {successRateData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </FramePanel>
                </Frame>
              </TabsContent>

              {/* Cost Tab */}
              <TabsContent value="cost" className="mt-0">
                <Frame>
                  <FrameHeader>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <FrameTitle>Cost per Test</FrameTitle>
                        <FrameDescription>
                          Average cost per test in cents (lower is better)
                        </FrameDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={isHorizontal ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setIsHorizontal(true)}
                        >
                          Horizontal
                        </Badge>
                        <Badge
                          variant={!isHorizontal ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setIsHorizontal(false)}
                        >
                          Vertical
                        </Badge>
                      </div>
                    </div>
                  </FrameHeader>
                  <FramePanel>
                    <div style={{ height: isHorizontal ? chartHeight : 500 }}>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                      >
                        <BarChart
                          key={`cost-${costData.length}`}
                          data={costData}
                          layout={isHorizontal ? "vertical" : "horizontal"}
                          margin={
                            isHorizontal
                              ? {
                                  top: 5,
                                  right: isMobile ? 10 : 30,
                                  left: isMobile ? 10 : yAxisWidth - 100,
                                  bottom: 5,
                                }
                              : { top: 20, right: 10, left: 10, bottom: 100 }
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={isHorizontal ? false : true}
                            vertical={isHorizontal ? true : false}
                          />
                          {isHorizontal ? (
                            <>
                              <XAxis type="number" unit="¢" />
                              <YAxis
                                type="category"
                                dataKey="model"
                                width={yAxisWidth}
                                tick={<CustomYAxisTick showIcon={!isMobile} />}
                                tickLine={false}
                                interval={0}
                              />
                            </>
                          ) : (
                            <>
                              <XAxis
                                type="category"
                                dataKey="model"
                                tick={{
                                  fontSize: 10,
                                  angle: -45,
                                  textAnchor: "end",
                                }}
                                tickLine={false}
                                interval={0}
                                height={80}
                              />
                              <YAxis type="number" unit="¢" />
                            </>
                          )}
                          <Tooltip
                            content={
                              <CustomBarTooltip
                                valueLabel="Cost/Test"
                                valueSuffix="¢"
                                valueKey="costCents"
                              />
                            }
                            cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                            isAnimationActive={false}
                          />
                          <Bar
                            dataKey="costCents"
                            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                          >
                            {costData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </FramePanel>
                </Frame>
              </TabsContent>

              {/* Speed Tab */}
              <TabsContent value="speed" className="mt-0">
                <Frame>
                  <FrameHeader>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <FrameTitle>Response Speed</FrameTitle>
                        <FrameDescription>
                          Average response time in seconds (lower is better)
                        </FrameDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={isHorizontal ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setIsHorizontal(true)}
                        >
                          Horizontal
                        </Badge>
                        <Badge
                          variant={!isHorizontal ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setIsHorizontal(false)}
                        >
                          Vertical
                        </Badge>
                      </div>
                    </div>
                  </FrameHeader>
                  <FramePanel>
                    <div style={{ height: isHorizontal ? chartHeight : 500 }}>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                      >
                        <BarChart
                          key={`speed-${speedData.length}`}
                          data={speedData}
                          layout={isHorizontal ? "vertical" : "horizontal"}
                          margin={
                            isHorizontal
                              ? {
                                  top: 5,
                                  right: isMobile ? 10 : 30,
                                  left: isMobile ? 10 : yAxisWidth - 100,
                                  bottom: 5,
                                }
                              : { top: 20, right: 10, left: 10, bottom: 100 }
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={isHorizontal ? false : true}
                            vertical={isHorizontal ? true : false}
                          />
                          {isHorizontal ? (
                            <>
                              <XAxis type="number" unit="s" />
                              <YAxis
                                type="category"
                                dataKey="model"
                                width={yAxisWidth}
                                tick={<CustomYAxisTick showIcon={!isMobile} />}
                                tickLine={false}
                                interval={0}
                              />
                            </>
                          ) : (
                            <>
                              <XAxis
                                type="category"
                                dataKey="model"
                                tick={{
                                  fontSize: 10,
                                  angle: -45,
                                  textAnchor: "end",
                                }}
                                tickLine={false}
                                interval={0}
                                height={80}
                              />
                              <YAxis type="number" unit="s" />
                            </>
                          )}
                          <Tooltip
                            content={
                              <CustomBarTooltip
                                valueLabel="Avg Time"
                                valueSuffix="s"
                                valueKey="speedSeconds"
                              />
                            }
                            cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
                            isAnimationActive={false}
                          />
                          <Bar
                            dataKey="speedSeconds"
                            radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                          >
                            {speedData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </FramePanel>
                </Frame>
              </TabsContent>

              {/* Combined Tab */}
              <TabsContent value="combined" className="mt-0">
                <Frame>
                  <FrameHeader>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <FrameTitle>Performance vs Total Cost</FrameTitle>
                        <FrameDescription>
                          Top-left is ideal: higher accuracy, lower total cost.
                          Click on models to remove them.
                        </FrameDescription>
                      </div>
                      {isZoomed && (
                        <Button variant="outline" size="sm" onClick={resetZoom}>
                          Reset Zoom
                        </Button>
                      )}
                    </div>
                  </FrameHeader>
                  <FramePanel>
                    <div className="h-[600px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                      >
                        <ScatterChart
                          margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid
                            strokeDasharray="1 3"
                            stroke="hsl(0 0% 35%)"
                          />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name="Total Cost"
                            unit="$"
                            domain={xDomain}
                            allowDataOverflow
                            tickCount={6}
                            tickFormatter={(value) => `${Math.round(value)}`}
                          >
                            <Label
                              value="Total Cost ($)"
                              offset={-10}
                              position="insideBottom"
                            />
                          </XAxis>
                          <YAxis
                            type="number"
                            dataKey="y"
                            name="Success Rate"
                            unit="%"
                            domain={yDomain}
                            allowDataOverflow
                          >
                            <Label
                              value="Success Rate (%)"
                              angle={-90}
                              position="insideLeft"
                              style={{ textAnchor: "middle" }}
                            />
                          </YAxis>
                          <ZAxis range={[80, 80]} />
                          {hoveredPoint &&
                            (() => {
                              const entry = combinedData.find(
                                (d) => d.model === hoveredPoint,
                              );
                              if (!entry) return null;
                              return (
                                <>
                                  <ReferenceLine
                                    x={entry.x}
                                    stroke="hsl(0 0% 50%)"
                                    strokeDasharray="5 5"
                                    strokeWidth={1}
                                  />
                                  <ReferenceLine
                                    y={entry.y}
                                    stroke="hsl(0 0% 50%)"
                                    strokeDasharray="5 5"
                                    strokeWidth={1}
                                  />
                                </>
                              );
                            })()}
                          <Tooltip
                            cursor={false}
                            isAnimationActive={false}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-card text-card-foreground border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold">
                                      {data.model}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Success Rate:{" "}
                                      {data.successRate.toFixed(2)}%
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Total Cost: ${data.totalCost.toFixed(4)}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter
                            data={combinedData}
                            shape={<CustomScatterShape />}
                            isAnimationActive={false}
                            onClick={(data: any) => {
                              if (data?.payload?.model) {
                                const model = data.payload.model;
                                setSelectedModels((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(model);
                                  return newSet;
                                });
                                setHoveredPoint(null);
                              }
                            }}
                            onMouseEnter={(data: any) => {
                              if (data?.payload?.model) {
                                setHoveredPoint(data.payload.model);
                              }
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <LabelList
                              dataKey="model"
                              position="top"
                              offset={12}
                              style={{
                                fontSize: 10,
                                pointerEvents: "none",
                              }}
                              className="fill-foreground"
                            />
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </FramePanel>
                </Frame>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
