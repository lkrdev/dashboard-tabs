import { Box } from "@looker/components";
import React, { useEffect, useRef } from "react";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "./AppContext";
import LkrLoading from "./components/LkrLoading";
import useConfigContext from "./ConfigContext";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";
import { getTextColor } from "./utils/colorUtils";
import {
  DEFAULT_DASHBOARD_PAPER_COLOR,
  getHorizonStyle,
  HORIZON_BG,
} from "./utils/constants";

const App: React.FC = () => {
  const { isLoading, me } = useAppContext();
  const initial_wait = useBoolean(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      initial_wait.setFalse();
    }, 1000);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const { config } = useConfigContext();
  const { theme, remove_branded_loading, background_color } = config;
  const isHorizon = theme === "horizon";
  const horizonStyle = isHorizon ? getHorizonStyle(config) : undefined;
  const customHorizonBg = Boolean(config.horizon_background_color) || undefined;

  if (isLoading || (initial_wait.value && !Boolean(remove_branded_loading))) {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        className={isHorizon ? "hz-bg" : undefined}
        data-custom-bg={isHorizon ? customHorizonBg : undefined}
        style={horizonStyle}
        backgroundColor={
          isHorizon ? undefined : background_color || DEFAULT_DASHBOARD_PAPER_COLOR
        }
      >
        {!Boolean(remove_branded_loading) && (
          <LkrLoading
            duration={750}
            color={
              isHorizon
                ? getTextColor(config.horizon_background_color || HORIZON_BG)
                : getTextColor(
                    background_color || DEFAULT_DASHBOARD_PAPER_COLOR
                  )
            }
          />
        )}
      </Box>
    );
  } else if (me) {
    if (isHorizon) {
      return (
        <div
          className="hz-shell hz-bg"
          data-custom-bg={customHorizonBg}
          style={horizonStyle}
        >
          <Sidebar />
          <Dashboard />
        </div>
      );
    }
    return (
      <>
        <Box
          p="medium"
          display="grid"
          height="100%"
          backgroundColor={background_color}
          style={{ gridTemplateColumns: "300px 1fr", gap: "12px" }}
        >
          <Sidebar />
          <Dashboard />
        </Box>
      </>
    );
  } else {
    return <Box>Unknown error</Box>;
  }
};

export default App;
