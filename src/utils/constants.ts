import type { CSSProperties } from "react";
import { getReadableTextColor, getTextColor, isLightColor } from "./colorUtils";

export const DEFAULT_DASHBOARD_BACKGROUND_COLOR = "#A3B3C9";
export const DEFAULT_DASHBOARD_PAPER_COLOR = "#f6f8fa";
export const HORIZON_BG = "#2563eb";
export const HORIZON_PAPER = "#ffffff";
export const HORIZON_ACCENT = "#2563eb";

export const createDashboardTheme = (config: {
  theme?: string;
  background_color?: string;
  paper_color?: string;
  horizon_paper_color?: string;
  horizon_accent_color?: string;
  hide_dashboard_header?: boolean;
}) => {
  const isHorizon = config.theme === "horizon";
  const paper = isHorizon
    ? config.horizon_paper_color || HORIZON_PAPER
    : config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR;
  const button = isHorizon
    ? config.horizon_accent_color || HORIZON_ACCENT
    : config.background_color || DEFAULT_DASHBOARD_BACKGROUND_COLOR;
  const textColor = getTextColor(paper);
  return {
    _theme: JSON.stringify({
      background_color: paper,
      tile_text_color: textColor,
      text_tile_text_color: textColor,
      body_text_color: textColor,
      font_color: textColor,
      primary_button_color: button,
      title_color: textColor,
      ...(config.hide_dashboard_header ? { show_dashboard_header: false } : {}),
    }),
  };
};

export const getHorizonStyle = (config: {
  horizon_background_color?: string;
  horizon_paper_color?: string;
  horizon_accent_color?: string;
}): CSSProperties => {
  const bg = config.horizon_background_color || HORIZON_BG;
  const paper = config.horizon_paper_color || HORIZON_PAPER;
  const accent = config.horizon_accent_color || HORIZON_ACCENT;
  return {
    "--hz-bg": bg,
    "--hz-paper": paper,
    "--hz-accent": accent,
    "--hz-accent-fg": getReadableTextColor(accent),
    "--hz-ink": isLightColor(paper) ? "#0f172a" : "#f8fafc",
    "--hz-rim": isLightColor(bg)
      ? "rgba(15, 23, 42, 0.12)"
      : "rgba(255, 255, 255, 0.85)",
  } as CSSProperties;
};
