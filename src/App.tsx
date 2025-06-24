import { Box } from "@looker/components";
import React from "react";
import { useAppContext } from "./AppContext";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";

const App: React.FC = () => {
  const { isLoading, me } = useAppContext();
  if (isLoading) {
    return <Box>Loading...</Box>;
  } else if (me) {
    return (
      <>
        <Box
          p="medium"
          display="grid"
          height="100%"
          backgroundColor="#A3B3C9"
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
