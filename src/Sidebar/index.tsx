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
import styled from "styled-components";
import useSWR from "swr";
import { useAppContext } from "../AppContext";
import useConfigContext from "../ConfigContext";
import useSdk from "../hooks/useSdk";
import Settings from "../Settings";
import { getBoardList } from "../utils/getBoardList";
import AdhocDashboard from "./AdhocDashboard";
import BoardList from "./BoardList";
import BoardNavigation from "./BoardNavigation";
import DashboardItem from "./DashboardItem";
import FolderNavigation from "./FolderNavigation";
import { PrintAll } from "./PrintAll";
import SaveAdhocDashboard from "./SaveAdhocDashboard";
import SwitchToAdhocDashboard from "./SwitchToAdhocDashboard";

const StyledListItem = styled(ListItem)`
  position: relative;
  & .remove-button {
    display: none;
  }
  &:hover .remove-button {
    display: flex;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    align-items: center;
    justify-content: center;
  }
`;

const Sidebar: React.FC = () => {
  const { config: config_data, can_update_settings } = useConfigContext();
  const dashboard_ids: string[] = config_data.dashboards || [];
  const { folder_id, board_id, adhoc_dashboard_ids } = useAppContext();
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

  const type = adhoc_dashboard_ids
    ? "adhoc"
    : folder_id?.length
    ? "folder"
    : board_id?.length
    ? "board"
    : "default";

  const show_dashboards =
    type === "adhoc"
      ? adhoc_dashboard_ids
      : type === "folder"
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
      <Header style={{ justifyContent: "space-between" }}>
        <Span p="xsmall" fontSize="xlarge">
          <Balancer>{header_title}</Balancer>
        </Span>
      </Header>
      {type === "board" && <BoardList />}
      {type !== "board" && (
        <>
          {show_dashboards!.length === 0 ? (
            <Span p="xsmall" fontSize="xsmall">
              No default dashboards found
            </Span>
          ) : (
            <List>
              {show_dashboards!.map((dashboard_id: string) => {
                return (
                  <DashboardItem
                    key={dashboard_id}
                    dashboard_id={dashboard_id}
                  />
                );
              })}
            </List>
          )}
        </>
      )}
      {adhoc_dashboard_ids && <AdhocDashboard />}
      <Box flexGrow={1} />
      <SpaceVertical gap="xsmall" width="100%">
        {Boolean(can_update_settings) && <Settings />}
        {Boolean(
          config_data?.allow_adhoc_dashboards && !adhoc_dashboard_ids
        ) && (
          <SwitchToAdhocDashboard
            current_dashboard_ids={
              board_id?.length && board.data
                ? getBoardList(board.data!)
                    .filter((bl) => bl.type === "dashboard")
                    .map((b) => b.id!)
                : show_dashboards || []
            }
          />
        )}
        {Boolean(config_data?.enable_folder_navigation) && <FolderNavigation />}
        {Boolean(config_data?.enable_board_navigation) && <BoardNavigation />}
        {Boolean(config_data?.save_board_from_adhoc_dashboards) && (
          <SaveAdhocDashboard />
        )}
        {Boolean(config_data?.print_all_dashboards) && <PrintAll />}
      </SpaceVertical>
    </Card>
  );
};

export default Sidebar;
