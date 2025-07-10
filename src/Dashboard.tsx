import { Card } from "@looker/components";
import { getEmbedSDK, ILookerConnection } from "@looker/embed-sdk";
import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "./AppContext";
import useConfigContext from "./ConfigContext";
import useExtensionSdk from "./hooks/useExtensionSdk";
import useSdk from "./hooks/useSdk";
import { createDashboardTheme } from "./utils/constants";
import { getBoardList } from "./utils/getBoardList";
import { urlToRecord } from "./utils/urlToRecord";

const StyledCard = styled(Card)<{
  iframe_visible?: boolean;
}>`
  width: 100%;
  height: 100%;
  & > iframe {
    visibility: ${({ iframe_visible }) =>
      iframe_visible ? "visible" : "hidden"};
    width: 100%;
    height: 100%;
  }
`;

const Dashboard: React.FC = () => {
  const {
    updateGlobalFilters,
    setDashboard,
    folder_id,
    board_id,
    changeDashboardId,
    selected_dashboard_id,
  } = useAppContext();
  const extension_sdk = useExtensionSdk();
  const { config } = useConfigContext();
  const sdk = useSdk();
  const { getSearchParams } = useAppContext();
  const iframe_visible = useBoolean(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // if there are errors and we dont see dashboard:loaded event, show iframe anyway
    timeoutRef.current = setTimeout(() => {
      iframe_visible.setTrue();
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const folder_dashboards = useSWR(
    folder_id?.length ? `folder-dashboards-${folder_id}` : null,
    () => sdk.ok(sdk.folder_dashboards(folder_id!, "id"))
  );
  const board = useSWR(board_id?.length ? `board-${board_id}` : null, () =>
    sdk.ok(sdk.board(board_id!))
  );

  const dashboardRef = useCallback(
    (el: HTMLDivElement) => {
      if (el && !el.children.length) {
        const embed_sdk = getEmbedSDK();
        embed_sdk.init(extension_sdk.lookerHostData?.hostUrl!);
        let initial_dashboard = selected_dashboard_id;
        if (!initial_dashboard) {
          if (folder_id) {
            initial_dashboard = folder_dashboards.data?.[0]?.id;
          } else if (board_id && board.data) {
            const list = getBoardList(board.data!);
            initial_dashboard = list.find(
              (item) => item.type === "dashboard"
            )?.id;
          } else {
            initial_dashboard = config.dashboards?.[0];
          }
        }

        if (!initial_dashboard) {
          return;
        }
        if (!selected_dashboard_id) {
          changeDashboardId(initial_dashboard, true);
        }
        const global_filters = getSearchParams(true);
        embed_sdk
          .createDashboardWithId(initial_dashboard)
          .withParams({ ...global_filters, ...createDashboardTheme(config) })
          .appendTo(el)
          .on("dashboard:loaded", () => {
            iframe_visible.setTrue();
          })
          .on("page:changed", (event: any) => {
            if (event?.page?.absoluteUrl?.length) {
              const items = urlToRecord(event.page.absoluteUrl);
              updateGlobalFilters(items.filters);
            }
          })
          .build()
          .connect()
          .then((connection: ILookerConnection) => {
            setDashboard(connection);
          })
          .catch((error: any) => {
            console.error("Error embedding dashboard:", error);
          });
      }
    },
    [
      extension_sdk,
      updateGlobalFilters,
      setDashboard,
      folder_dashboards.data,
      board.data,
      selected_dashboard_id,
    ]
  );
  return (
    <StyledCard
      raised
      borderRadius="large"
      ref={dashboardRef}
      iframe_visible={iframe_visible.value}
    />
  );
};

export default Dashboard;
