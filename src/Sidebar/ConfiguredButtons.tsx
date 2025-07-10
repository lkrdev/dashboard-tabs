import {
  ButtonOutline,
  Popover,
  PopoverLayout,
  SpaceVertical,
} from "@looker/components";
import { ChevronRight } from "@styled-icons/material";
import React, { useMemo } from "react";
import useSWR from "swr";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "../AppContext";
import useConfigContext from "../ConfigContext";
import useSdk from "../hooks/useSdk";
import Settings from "../Settings";
import { getBoardList } from "../utils/getBoardList";
import BoardNavigation from "./BoardNavigation";
import FolderNavigation from "./FolderNavigation";
import { PrintAll } from "./PrintAll";
import SaveAdhocDashboard from "./SaveAdhocDashboard";
import SwitchToAdhocDashboard from "./SwitchToAdhocDashboard";

const ConfiguredButtons: React.FC = () => {
  const { config: config_data, can_update_settings } = useConfigContext();
  const dashboard_ids: string[] = config_data.dashboards || [];
  const { folder_id, board_id, adhoc_dashboard_ids } = useAppContext();
  const sdk = useSdk();
  const popoverOpen = useBoolean(false);

  const folder_dashboards = useSWR(
    folder_id?.length ? `folder-dashboards-${folder_id}` : null,
    () => sdk.ok(sdk.folder_dashboards(folder_id!, "id"))
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

  // Count active buttons (including disabled ones)
  const activeButtons = useMemo(() => {
    const buttons: Array<{
      component: React.ComponentType<any>;
      key: string;
      props?: any;
    }> = [];

    if (can_update_settings) {
      buttons.push({ component: Settings, key: "settings" });
    }

    if (config_data?.allow_adhoc_dashboards) {
      buttons.push({
        component: SwitchToAdhocDashboard,
        key: "switch_adhoc",
        props: {
          current_dashboard_ids:
            board_id?.length && board.data
              ? getBoardList(board.data!)
                  .filter((bl) => bl.type === "dashboard")
                  .map((b) => b.id!)
              : show_dashboards || [],
        },
      });
    }

    if (config_data?.enable_folder_navigation) {
      buttons.push({ component: FolderNavigation, key: "folder_nav" });
    }

    if (config_data?.enable_board_navigation) {
      buttons.push({ component: BoardNavigation, key: "board_nav" });
    }

    if (
      config_data?.save_board_from_adhoc_dashboards &&
      adhoc_dashboard_ids &&
      adhoc_dashboard_ids.length > 0
    ) {
      buttons.push({ component: SaveAdhocDashboard, key: "save_adhoc" });
    }

    if (config_data?.print_all_dashboards) {
      buttons.push({ component: PrintAll, key: "print_all" });
    }

    return buttons;
  }, [can_update_settings, config_data, board_id, board.data, show_dashboards]);

  // If only one button, show it directly
  if (activeButtons.length === 1) {
    const button = activeButtons[0];
    const Component = button.component;
    return <Component {...button.props} />;
  }

  // If multiple buttons, show popover
  if (activeButtons.length > 1) {
    return (
      <Popover
        key={activeButtons.map((b) => b.key).join(",")}
        isOpen={popoverOpen.value}
        placement="right"
        onClose={() => popoverOpen.setFalse()}
        content={
          <PopoverLayout header="Actions" footer={false}>
            <SpaceVertical gap="xsmall" width="300px">
              {activeButtons.map((button) => {
                const Component = button.component;
                return <Component key={button.key} {...button.props} />;
              })}
            </SpaceVertical>
          </PopoverLayout>
        }
      >
        <ButtonOutline
          iconAfter={<ChevronRight size={16} />}
          onClick={() => popoverOpen.setTrue()}
          fullWidth
          color="neutral"
        >
          Actions
        </ButtonOutline>
      </Popover>
    );
  }

  // No buttons to show
  return null;
};

export default ConfiguredButtons;
