import { Box, Card, Header, List, ListItem, Span } from "@looker/components";
import React from "react";
import Balancer from "react-wrap-balancer";
import useSWR from "swr";
import { useAppContext } from "./AppContext";
import useExtensionSdk from "./hooks/useExtensionSdk";
import useSdk from "./hooks/useSdk";
import Settings from "./Settings";
import { DASHBOARD_ID_KEY } from "./utils/constants";

const Sidebar: React.FC = () => {
  const extension_sdk = useExtensionSdk();
  const config_data = extension_sdk.getContextData();
  const dashboard_ids: string[] = config_data?.[DASHBOARD_ID_KEY] || [];
  const { global_filters, dashboard, folder_id, setSelectedDashboardId } =
    useAppContext();
  const sdk = useSdk();
  const folder_dashboards = useSWR(
    folder_id ? `folder-dashboards-${folder_id}` : null,
    () => sdk.ok(sdk.folder_dashboards(folder_id!, "id"))
  );
  const show_dashboards = folder_id
    ? folder_dashboards.data?.map((d) => d.id!) || []
    : dashboard_ids;

  return (
    <Card
      raised
      position="relative"
      backgroundColor="#B7C9E2"
      p="xsmall"
      borderRadius="large"
    >
      <Header>
        <Span p="xsmall" fontSize="xlarge">
          <Balancer>Tabbed Dashboard Dashboard Elevate '25</Balancer>
        </Span>
      </Header>
      <List>
        {show_dashboards.map((dashboard_id: string) => {
          const Item = ({ dashboard_id }: { dashboard_id: string }) => {
            const db = useSWR(dashboard_id, () =>
              sdk.ok(sdk.dashboard(dashboard_id, "id,title"))
            );
            return (
              <ListItem
                itemRole="link"
                selected={dashboard?._currentPathname?.startsWith(
                  `/embed/dashboards/${dashboard_id}`
                )}
                onClick={() => {
                  setSelectedDashboardId(dashboard_id);
                  dashboard?.loadDashboard(
                    dashboard_id +
                      "?" +
                      Object.entries(global_filters)
                        .map(([key, value]) => `${key}=${value}`)
                        .join("&")
                  );
                }}
              >
                {db.data?.title || dashboard_id}
              </ListItem>
            );
          };
          return <Item key={dashboard_id} dashboard_id={dashboard_id} />;
        })}
      </List>
      {/* <CodeBlock fontSize="xxsmall">
        {JSON.stringify(global_filters, null, 2)}
      </CodeBlock> */}
      <Box flexGrow={1} />
      <Settings />
    </Card>
  );
};

export default Sidebar;
