import type { ComponentType, SVGProps } from "react";

import OpenAIIcon from "@/components/icons/providers/openai";
import AnthropicIcon from "@/components/icons/providers/anthropic";
import ClaudeIcon from "@/components/icons/providers/claude";
import GoogleIcon from "@/components/icons/providers/google";
import GeminiIcon from "@/components/icons/providers/gemini";
import DeepSeekIcon from "@/components/icons/providers/deepseek";
import XAIIcon from "@/components/icons/providers/xai";
import GrokIcon from "@/components/icons/providers/grok";
import QwenIcon from "@/components/icons/providers/qwen";
import KimiIcon from "@/components/icons/providers/kimi";
import ZAIIcon from "@/components/icons/providers/zai";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const providerIconMap: Record<string, IconComponent> = {
  openai: OpenAIIcon,
  anthropic: AnthropicIcon,
  claude: ClaudeIcon,
  google: GoogleIcon,
  gemini: GeminiIcon,
  deepseek: DeepSeekIcon,
  xai: XAIIcon,
  grok: GrokIcon,
  qwen: QwenIcon,
  kimi: KimiIcon,
  zai: ZAIIcon,
  glm: ZAIIcon,
} as const;

/**
 * Get provider icon by provider name
 */
export function getProviderIcon(provider: string): IconComponent | null {
  const normalizedProvider = provider.toLowerCase();
  return providerIconMap[normalizedProvider] || null;
}

/**
 * Extract provider from model name and return the corresponding icon
 */
export function getProviderIconByModelName(
  modelName: string,
): IconComponent | null {
  const lowerName = modelName.toLowerCase();

  // OpenAI models
  if (
    lowerName.startsWith("gpt-") ||
    lowerName.startsWith("o3") ||
    lowerName.startsWith("o4")
  ) {
    return OpenAIIcon;
  }

  // Anthropic/Claude models
  if (lowerName.startsWith("claude-")) {
    return ClaudeIcon;
  }

  // Google/Gemini models
  if (lowerName.startsWith("gemini-")) {
    return GeminiIcon;
  }

  // xAI/Grok models
  if (lowerName.startsWith("grok-")) {
    return GrokIcon;
  }

  // DeepSeek models
  if (lowerName.startsWith("deepseek-")) {
    return DeepSeekIcon;
  }

  // Qwen models
  if (lowerName.startsWith("qwen")) {
    return QwenIcon;
  }

  // Kimi models
  if (lowerName.startsWith("kimi-")) {
    return KimiIcon;
  }

  // GLM/Z.ai models
  if (lowerName.startsWith("glm-")) {
    return ZAIIcon;
  }

  return null;
}

/**
 * Get provider name from model name
 */
export function getProviderFromModelName(modelName: string): string | null {
  const lowerName = modelName.toLowerCase();

  if (
    lowerName.startsWith("gpt-") ||
    lowerName.startsWith("o3") ||
    lowerName.startsWith("o4")
  ) {
    return "OpenAI";
  }
  if (lowerName.startsWith("claude-")) {
    return "Anthropic";
  }
  if (lowerName.startsWith("gemini-")) {
    return "Google";
  }
  if (lowerName.startsWith("grok-")) {
    return "xAI";
  }
  if (lowerName.startsWith("deepseek-")) {
    return "DeepSeek";
  }
  if (lowerName.startsWith("qwen")) {
    return "Qwen";
  }
  if (lowerName.startsWith("kimi-")) {
    return "Kimi";
  }
  if (lowerName.startsWith("glm-")) {
    return "GLM";
  }

  return null;
}
