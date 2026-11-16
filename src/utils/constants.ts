import { getTextColor } from "./colorUtils";

export const createDashboardTheme = (config: {
  theme?: string;
  background_color?: string;
  paper_color?: string;
  hide_dashboard_header?: boolean;
}) => {
  const isHorizon = config.theme === "horizon";
  const paper = isHorizon
    ? "#ffffff"
    : config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR;
  const button = isHorizon
    ? "#2563EB"
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

export const DEFAULT_DASHBOARD_BACKGROUND_COLOR = "#A3B3C9";
export const DEFAULT_DASHBOARD_PAPER_COLOR = "#f6f8fa";
