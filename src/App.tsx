import { Box } from "@looker/components";
import React from "react";
import { useTheme } from "styled-components";
import { useAppContext } from "./AppContext";
import LkrLoading from "./components/LkrLoading";
import useConfigContext from "./ConfigContext";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";

const App: React.FC = () => {
  const { isLoading, me } = useAppContext();
  const theme = useTheme();
  console.log(theme);

  const {
    config: { remove_branded_loading, background_color },
  } = useConfigContext();
  if (isLoading) {
    return (
      <Box
        height="100vh"
        width="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {!Boolean(remove_branded_loading) && <LkrLoading duration={750} />}
      </Box>
    );
  } else if (me) {
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
