import { Card } from "@looker/components";
import { getEmbedSDK, ILookerConnection } from "@looker/embed-sdk";
import React, { useCallback } from "react";
import styled from "styled-components";
import { useAppContext } from "./AppContext";
import useExtensionSdk from "./hooks/useExtensionSdk";
import { urlToRecord } from "./utils/urlToRecord";
import useSdk from "./hooks/useSdk";
import useSWR from "swr";

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
  const { dashboard, setGlobalFilters, setDashboard, global_filters, folder_id, setSelectedDashboardId, selected_dashboard_id } = useAppContext();
  const extension_sdk = useExtensionSdk();
  const sdk = useSdk();
  const folder_dashboards = useSWR(
    folder_id ? `folder-dashboards-${folder_id}` : null, 
    ()=>sdk.ok(sdk.folder_dashboards(folder_id!, "id"))
  )
  const dashboardRef = useCallback(
    (el: HTMLDivElement) => {
      if (el && !el.children.length) {
        const embed_sdk = getEmbedSDK();
        embed_sdk.init(extension_sdk.lookerHostData?.hostUrl!);
        let initial_dashboard = selected_dashboard_id;
        if (!initial_dashboard) {
          if (folder_id) {
            initial_dashboard = folder_dashboards.data?.[0].id
          } else {
            initial_dashboard = extension_sdk.getContextData()?.dashboards?.[0];
          }
        }
        
        if (!initial_dashboard) {
          return
        }
        if (!selected_dashboard_id) {
          setSelectedDashboardId(initial_dashboard)
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
    [extension_sdk, setGlobalFilters, setDashboard, folder_dashboards.data]
  )
  return <StyledCard p="xsmall" raised borderRadius="large" ref={dashboardRef} />
};

export default Dashboard;
