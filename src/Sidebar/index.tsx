import {
  Box,
  Card,
  Header,
  List,
  ListItem,
  SpaceVertical,
  Span,
} from "@looker/components";
import React, { useMemo } from "react";
import Balancer from "react-wrap-balancer";
import useSWR from "swr";
import { useAppContext } from "../AppContext";
import { useExtensionContextData } from "../hooks/useExtensionContext";
import useSdk from "../hooks/useSdk";
import Settings from "../Settings";
import BoardList from "./BoardList";
import BoardNavigation from "./BoardNavigation";
import FolderNavigation from "./FolderNavigation";
import { PrintAll } from "./PrintAll";

const Sidebar: React.FC = () => {
  const { config_data, can_update_settings } = useExtensionContextData();
  const dashboard_ids: string[] = config_data.dashboards || [];
  const { selected_dashboard_id, folder_id, board_id, changeDashboardId } =
    useAppContext();
  const sdk = useSdk();
  const folder_dashboards = useSWR(
    folder_id?.length ? `folder-dashboards-${folder_id}` : null,
    () => sdk.ok(sdk.folder_dashboards(folder_id!, "id"))
  );
  const folder = useSWR(folder_id?.length ? `folder-${folder_id}` : null, () =>
    sdk.ok(sdk.folder(folder_id!, "id,name"))
  );
  const board = useSWR(board_id?.length ? `board-${board_id}` : null, () =>
    sdk.ok(sdk.board(board_id!))
  );

  const show_dashboards = folder_id
    ? folder_dashboards.data?.map((d) => d.id!) || []
    : dashboard_ids;

  const header_title = useMemo(() => {
    if (folder?.data?.name) {
      return folder?.data?.name;
    } else if (board?.data?.title) {
      return board?.data?.title;
    } else {
      return config_data.label || "Dashboards";
    }
  }, [folder?.data?.name, board?.data?.title, config_data.label]);

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
          <Balancer>{header_title}</Balancer>
        </Span>
      </Header>
      {board_id?.length ? (
        <BoardList />
      ) : (
        <List>
          {show_dashboards.map((dashboard_id: string) => {
            const Item = ({ dashboard_id }: { dashboard_id: string }) => {
              const db = useSWR(`dashboard-${dashboard_id}`, () =>
                sdk.ok(sdk.dashboard(dashboard_id, "id,title"))
              );
              return (
                <ListItem
                  itemRole="link"
                  selected={selected_dashboard_id === dashboard_id}
                  onClick={() => {
                    changeDashboardId(dashboard_id);
                  }}
                >
                  {db.data?.title || dashboard_id}
                </ListItem>
              );
            };
            return <Item key={dashboard_id} dashboard_id={dashboard_id} />;
          })}
        </List>
      )}
      <Box flexGrow={1} />
      <SpaceVertical gap="xsmall" width="100%">
        {Boolean(can_update_settings) && <Settings />}
        {Boolean(config_data?.enable_folder_navigation) && <FolderNavigation />}
        {Boolean(config_data?.enable_board_navigation) && <BoardNavigation />}
        {Boolean(config_data?.print_all_dashboards) && <PrintAll />}
      </SpaceVertical>
    </Card>
  );
};

export default Sidebar;
