import { getTextColor } from "./colorUtils";

export const createDashboardTheme = (config: {
  background_color?: string;
  paper_color?: string;
}) => ({
  _theme: JSON.stringify({
    background_color: config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR,
    tile_text_color: getTextColor(
      config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR
    ),
    text_tile_text_color: getTextColor(
      config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR
    ),
    body_text_color: getTextColor(
      config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR
    ),
    font_color: getTextColor(
      config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR
    ),
    primary_button_color:
      config.background_color || DEFAULT_DASHBOARD_BACKGROUND_COLOR,
    title_color: getTextColor(
      config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR
    ),
  }),
});

export const DEFAULT_DASHBOARD_BACKGROUND_COLOR = "#A3B3C9";
export const DEFAULT_DASHBOARD_PAPER_COLOR = "#f6f8fa";
