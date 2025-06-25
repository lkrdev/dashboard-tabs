import { Card } from "@looker/components";
import { getEmbedSDK, ILookerConnection } from "@looker/embed-sdk";
import React, { useCallback } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useAppContext } from "./AppContext";
import { useExtensionContextData } from "./hooks/useExtensionContext";
import useExtensionSdk from "./hooks/useExtensionSdk";
import useSdk from "./hooks/useSdk";
import { getBoardList } from "./utils/getBoardList";
import { urlToRecord } from "./utils/urlToRecord";

const StyledCard = styled(Card)`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  & > iframe {
    width: 100%;
    height: 100%;
  }
`;

const Dashboard: React.FC = () => {
  const {
    setGlobalFilters,
    setDashboard,
    global_filters,
    folder_id,
    board_id,
    changeDashboardId,
    selected_dashboard_id,
  } = useAppContext();
  const extension_sdk = useExtensionSdk();
  const { config_data } = useExtensionContextData();
  const sdk = useSdk();

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
            initial_dashboard = config_data.dashboards?.[0];
          }
        }

        if (!initial_dashboard) {
          return;
        }
        if (!selected_dashboard_id) {
          changeDashboardId(initial_dashboard, true);
        }
        embed_sdk
          .createDashboardWithId(initial_dashboard)
          .withParams(global_filters)
          .appendTo(el)
          .on("page:changed", (event: any) => {
            if (event?.page?.absoluteUrl?.length) {
              const record = urlToRecord(event.page.absoluteUrl);
              setGlobalFilters((previous_filter) => {
                return { ...previous_filter, ...record };
              });
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
      setGlobalFilters,
      setDashboard,
      folder_dashboards.data,
      board.data,
    ]
  );
  return (
    <StyledCard p="xsmall" raised borderRadius="large" ref={dashboardRef} />
  );
};

export default Dashboard;
