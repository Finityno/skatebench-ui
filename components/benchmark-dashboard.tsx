"use client";

import { useState, useMemo, useCallback } from "react";
import * as React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import { getProviderIconByModelName } from "@/lib/provider-icons";
import OpenAIIcon from "@/components/icons/providers/openai";
import ClaudeIcon from "@/components/icons/providers/claude";
import GeminiIcon from "@/components/icons/providers/gemini";
import DeepSeekIcon from "@/components/icons/providers/deepseek";
import GrokIcon from "@/components/icons/providers/grok";
import QwenIcon from "@/components/icons/providers/qwen";
import KimiIcon from "@/components/icons/providers/kimi";
import ZAIIcon from "@/components/icons/providers/zai";

const benchmarkData = [
  {
    model: "gpt-5-high",
    correct: 204,
    totalTests: 210,
    successRate: 97.14,
    averageDuration: 26653,
    totalCost: 3.0146,
    averageCostPerTest: 0.01436,
  },
  {
    model: "gpt-5-default",
    correct: 203,
    totalTests: 210,
    successRate: 96.67,
    averageDuration: 14530,
    totalCost: 1.3521,
    averageCostPerTest: 0.00644,
  },
  {
    model: "o3-pro",
    correct: 202,
    totalTests: 210,
    successRate: 96.19,
    averageDuration: 43642,
    totalCost: 8.566,
    averageCostPerTest: 0.04079,
  },
  {
    model: "gpt-5.1-high",
    correct: 191,
    totalTests: 210,
    successRate: 90.95,
    averageDuration: 10432,
    totalCost: 1.3573,
    averageCostPerTest: 0.00646,
  },
  {
    model: "gpt-5.1-default",
    correct: 184,
    totalTests: 210,
    successRate: 87.62,
    averageDuration: 6071,
    totalCost: 0.6622,
    averageCostPerTest: 0.00315,
  },
  {
    model: "gemini-3-pro-preview",
    correct: 181,
    totalTests: 210,
    successRate: 86.19,
    averageDuration: 10600,
    totalCost: 1.8257,
    averageCostPerTest: 0.00869,
  },
  {
    model: "o3",
    correct: 177,
    totalTests: 210,
    successRate: 84.29,
    averageDuration: 14736,
    totalCost: 0.9691,
    averageCostPerTest: 0.00461,
  },
  {
    model: "gpt-5.2-xhigh",
    correct: 166,
    totalTests: 210,
    successRate: 79.05,
    averageDuration: 37058,
    totalCost: 5.3825,
    averageCostPerTest: 0.02563,
  },
  {
    model: "grok-4",
    correct: 149,
    totalTests: 210,
    successRate: 70.95,
    averageDuration: 36017,
    totalCost: 4.034,
    averageCostPerTest: 0.01921,
  },
  {
    model: "gpt-5.1-low",
    correct: 141,
    totalTests: 210,
    successRate: 67.14,
    averageDuration: 3938,
    totalCost: 0.2787,
    averageCostPerTest: 0.00133,
  },
  {
    model: "deepseek-r1-0528",
    correct: 130,
    totalTests: 210,
    successRate: 61.9,
    averageDuration: 21692,
    totalCost: 0.6218,
    averageCostPerTest: 0.00296,
  },
  {
    model: "kimi-k2-thinking",
    correct: 126,
    totalTests: 210,
    successRate: 60,
    averageDuration: 23842,
    totalCost: 0.4012,
    averageCostPerTest: 0.00191,
  },
  {
    model: "gemini-2.5-pro",
    correct: 121,
    totalTests: 210,
    successRate: 57.62,
    averageDuration: 11351,
    totalCost: 2.3175,
    averageCostPerTest: 0.01104,
  },
  {
    model: "gpt-5.2-high",
    correct: 105,
    totalTests: 210,
    successRate: 50,
    averageDuration: 8256,
    totalCost: 0.8689,
    averageCostPerTest: 0.00414,
  },
  {
    model: "gpt-5-mini",
    correct: 104,
    totalTests: 210,
    successRate: 49.52,
    averageDuration: 13553,
    totalCost: 0.3084,
    averageCostPerTest: 0.00147,
  },
  {
    model: "o4-mini",
    correct: 94,
    totalTests: 210,
    successRate: 44.76,
    averageDuration: 11654,
    totalCost: 0.8537,
    averageCostPerTest: 0.00407,
  },
  {
    model: "grok-4.1-fast",
    correct: 83,
    totalTests: 210,
    successRate: 39.52,
    averageDuration: 17042,
    totalCost: 0.1735,
    averageCostPerTest: 0.00083,
  },
  {
    model: "grok-3-mini",
    correct: 74,
    totalTests: 210,
    successRate: 35.24,
    averageDuration: 8384,
    totalCost: 0.0909,
    averageCostPerTest: 0.00043,
  },
  {
    model: "gemini-2.5-flash",
    correct: 58,
    totalTests: 210,
    successRate: 27.62,
    averageDuration: 585,
    totalCost: 0.0083,
    averageCostPerTest: 0.00004,
  },
  {
    model: "deepseek-v3.2",
    correct: 51,
    totalTests: 210,
    successRate: 24.29,
    averageDuration: 1872,
    totalCost: 0.0028,
    averageCostPerTest: 0.00001,
  },
  {
    model: "qwen3-235b-a22b-thinking",
    correct: 45,
    totalTests: 210,
    successRate: 21.43,
    averageDuration: 66275,
    totalCost: 0.3123,
    averageCostPerTest: 0.00149,
  },
  {
    model: "gpt-5-minimal",
    correct: 44,
    totalTests: 210,
    successRate: 20.95,
    averageDuration: 1027,
    totalCost: 0.0538,
    averageCostPerTest: 0.00026,
  },
  {
    model: "claude-4-opus",
    correct: 39,
    totalTests: 210,
    successRate: 18.57,
    averageDuration: 2252,
    totalCost: 0.5309,
    averageCostPerTest: 0.00253,
  },
  {
    model: "gpt-5-nano",
    correct: 32,
    totalTests: 210,
    successRate: 15.24,
    averageDuration: 29106,
    totalCost: 0.2361,
    averageCostPerTest: 0.00112,
  },
  {
    model: "deepseek-v3.1",
    correct: 31,
    totalTests: 210,
    successRate: 14.76,
    averageDuration: 2863,
    totalCost: 0.0062,
    averageCostPerTest: 0.00003,
  },
  {
    model: "claude-4.5-opus",
    correct: 30,
    totalTests: 210,
    successRate: 14.29,
    averageDuration: 3035,
    totalCost: 0.291,
    averageCostPerTest: 0.00139,
  },
  {
    model: "deepseek-v3.1-thinking",
    correct: 25,
    totalTests: 210,
    successRate: 11.9,
    averageDuration: 2863,
    totalCost: 0.0061,
    averageCostPerTest: 0.00003,
  },
  {
    model: "glm-4.5",
    correct: 19,
    totalTests: 210,
    successRate: 9.05,
    averageDuration: 3788,
    totalCost: 0.0365,
    averageCostPerTest: 0.00017,
  },
  {
    model: "gpt-4.1",
    correct: 18,
    totalTests: 210,
    successRate: 8.57,
    averageDuration: 1119,
    totalCost: 0.0516,
    averageCostPerTest: 0.00025,
  },
  {
    model: "gpt-4o",
    correct: 15,
    totalTests: 210,
    successRate: 7.14,
    averageDuration: 605,
    totalCost: 0.0598,
    averageCostPerTest: 0.00028,
  },
  {
    model: "gpt-oss-120b",
    correct: 9,
    totalTests: 210,
    successRate: 4.29,
    averageDuration: 7336,
    totalCost: 0.0331,
    averageCostPerTest: 0.00016,
  },
  {
    model: "gpt-5.2-none",
    correct: 8,
    totalTests: 210,
    successRate: 3.81,
    averageDuration: 773,
    totalCost: 0.0698,
    averageCostPerTest: 0.00033,
  },
  {
    model: "kimi-k2",
    correct: 7,
    totalTests: 210,
    successRate: 3.33,
    averageDuration: 964,
    totalCost: 0.0073,
    averageCostPerTest: 0.00003,
  },
  {
    model: "gpt-oss-20b",
    correct: 5,
    totalTests: 210,
    successRate: 2.38,
    averageDuration: 4541,
    totalCost: 0.021,
    averageCostPerTest: 0.0001,
  },
  {
    model: "glm-4.5v",
    correct: 4,
    totalTests: 210,
    successRate: 1.9,
    averageDuration: 952,
    totalCost: 0.0101,
    averageCostPerTest: 0.00005,
  },
  {
    model: "qwen-3-32b",
    correct: 1,
    totalTests: 210,
    successRate: 0.48,
    averageDuration: 13523,
    totalCost: 0.0545,
    averageCostPerTest: 0.00026,
  },
  {
    model: "claude-4-sonnet-non-thinking",
    correct: 0,
    totalTests: 210,
    successRate: 0,
    averageDuration: 1882,
    totalCost: 0.1023,
    averageCostPerTest: 0.00049,
  },
  {
    model: "claude-4-sonnet",
    correct: 0,
    totalTests: 210,
    successRate: 0,
    averageDuration: 1964,
    totalCost: 0.1018,
    averageCostPerTest: 0.00048,
  },
  {
    model: "claude-4.5-sonnet",
    correct: 0,
    totalTests: 210,
    successRate: 0,
    averageDuration: 2929,
    totalCost: 0.1423,
    averageCostPerTest: 0.00068,
  },
];

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
function CustomYAxisTick({ x, y, payload }: any) {
  const ProviderIcon = getProviderIconByModelName(payload.value);
  const iconSize = 14;
  const iconMargin = 6;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-iconSize - iconMargin}
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

export { BenchmarkDashboard };
export default function BenchmarkDashboard() {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    () => new Set(benchmarkData.slice(0, 10).map((d) => d.model)),
  );
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(true);

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
    return Math.max(150, Math.min(220, longest * 7 + 20));
  }, [filteredData]);

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
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

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          {/* Model Selector */}
          <Card className="h-fit xl:sticky xl:top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Model Selector</CardTitle>
              <CardDescription>
                {selectedModels.size} of {benchmarkData.length} models selected
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={selectAll}
                >
                  All
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={selectNone}
                >
                  None
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={selectTop10}
                >
                  Top 10
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] xl:h-[600px] pr-4">
                <div className="space-y-2">
                  {benchmarkData.map((item, index) => {
                    const ProviderIcon = getProviderIconByModelName(item.model);
                    return (
                      <div
                        key={item.model}
                        className="flex items-center gap-3 py-1"
                      >
                        <Checkbox
                          id={item.model}
                          checked={selectedModels.has(item.model)}
                          onCheckedChange={() => toggleModel(item.model)}
                        />
                        {ProviderIcon ? (
                          <ProviderIcon className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getModelColor(index) }}
                          />
                        )}
                        <label
                          htmlFor={item.model}
                          className="text-sm cursor-pointer flex-1 truncate"
                        >
                          {item.model}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {item.successRate.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
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
                        Percentage of correct answers out of 210 tests per model
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
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={successRateData}
                        layout={isHorizontal ? "vertical" : "horizontal"}
                        margin={
                          isHorizontal
                            ? {
                                top: 5,
                                right: 30,
                                left: yAxisWidth - 100,
                                bottom: 5,
                              }
                            : { top: 20, right: 30, left: 20, bottom: 100 }
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
                              tick={<CustomYAxisTick />}
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
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={costData}
                        layout={isHorizontal ? "vertical" : "horizontal"}
                        margin={
                          isHorizontal
                            ? {
                                top: 5,
                                right: 30,
                                left: yAxisWidth - 100,
                                bottom: 5,
                              }
                            : { top: 20, right: 30, left: 20, bottom: 100 }
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
                              tick={<CustomYAxisTick />}
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
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={speedData}
                        layout={isHorizontal ? "vertical" : "horizontal"}
                        margin={
                          isHorizontal
                            ? {
                                top: 5,
                                right: 30,
                                left: yAxisWidth - 100,
                                bottom: 5,
                              }
                            : { top: 20, right: 30, left: 20, bottom: 100 }
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
                              tick={<CustomYAxisTick />}
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
                        Click and drag to zoom.
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
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 40, right: 30, left: 20, bottom: 60 }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name="Total Cost"
                          unit="$"
                          domain={xDomain}
                          allowDataOverflow
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
                        {isSelecting &&
                          zoomArea.x1 !== null &&
                          zoomArea.x2 !== null &&
                          zoomArea.y1 !== null &&
                          zoomArea.y2 !== null && (
                            <ReferenceArea
                              x1={zoomArea.x1}
                              x2={zoomArea.x2}
                              y1={zoomArea.y1}
                              y2={zoomArea.y2}
                              strokeOpacity={0.3}
                              fill="hsl(215, 100%, 50%)"
                              fillOpacity={0.15}
                            />
                          )}
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
                                  stroke={entry.color}
                                  strokeDasharray="5 5"
                                  strokeWidth={2}
                                />
                                <ReferenceLine
                                  y={entry.y}
                                  stroke={entry.color}
                                  strokeDasharray="5 5"
                                  strokeWidth={2}
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
                                  <p className="font-semibold">{data.model}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Success Rate: {data.successRate.toFixed(2)}%
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
                              fill: "#888888",
                              pointerEvents: "none",
                            }}
                            fill="#888888"
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
  );
}
