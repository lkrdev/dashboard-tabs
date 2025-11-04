import { Box } from "@looker/components";
import React, { useEffect, useRef, useCallback } from "react";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "./AppContext";
import LkrLoading from "./components/LkrLoading";
import useConfigContext from "./ConfigContext";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";
import { getTextColor } from "./utils/colorUtils";
import { DEFAULT_DASHBOARD_PAPER_COLOR } from "./utils/constants";
import { useEditingPanel, EditingPanelProvider } from "./EditingPanelContext";
import EditingPanel from "./components/EditingPanel";
import useSdk from "./hooks/useSdk";

const App: React.FC = () => {
  const { isLoading, me, selected_dashboard_id } = useAppContext();
  const initial_wait = useBoolean(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const extensionContext = useSdk();

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

  const {
    config: { remove_branded_loading, background_color },
  } = useConfigContext();

  if (isLoading || (initial_wait.value && !Boolean(remove_branded_loading))) {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        backgroundColor={background_color || DEFAULT_DASHBOARD_PAPER_COLOR}
      >
        {!Boolean(remove_branded_loading) && (
          <LkrLoading
            duration={750}
            color={getTextColor(
              background_color || DEFAULT_DASHBOARD_PAPER_COLOR
            )}
          />
        )}
      </Box>
    );
  } else if (me) {
    return (
      <EditingPanelProvider extensionContext={extensionContext} selected_dashboard_id={selected_dashboard_id} user_id={me.id}>
        <AppContent />
      </EditingPanelProvider>
    );
  } else {
    return <Box>Unknown error</Box>;
  }
};

const AppContent: React.FC = () => {
  const { background_color } = useConfigContext().config;
  const { setDashboardLayout } = useAppContext()
  const { isEditing, editingLayout, closeEditingPanel, updateEditingLayout } = useEditingPanel();

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
      {isEditing && editingLayout !== undefined && editingLayout.layouts !== undefined && (
        <EditingPanel
          dashboardLayout={editingLayout}
          onUpdateLayout={updateEditingLayout}
          onClose={closeEditingPanel}
        />
      )}
    </>
  );
}

export default App;
