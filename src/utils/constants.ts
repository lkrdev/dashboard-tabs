export const createDashboardTheme = (config: {
  background_color?: string;
  paper_color?: string;
}) => ({
  _theme: JSON.stringify({
    background_color: config.paper_color || DEFAULT_DASHBOARD_PAPER_COLOR,
  }),
});

export const DEFAULT_DASHBOARD_BACKGROUND_COLOR = "#A3B3C9";
export const DEFAULT_DASHBOARD_PAPER_COLOR = "#ffffff";
