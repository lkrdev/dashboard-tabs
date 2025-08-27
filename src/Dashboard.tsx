import { Card } from "@looker/components";
import { getEmbedSDK, ILookerConnection } from "@looker/embed-sdk";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "./AppContext";
import VizSwapper from "./components/VizSwapper";
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
    setDashboardLayout,
    dashboard,
    dashboardLayout
  } = useAppContext();
  const extension_sdk = useExtensionSdk();
  const { config } = useConfigContext();
  const sdk = useSdk();
  const { getSearchParams } = useAppContext();
  const iframe_visible = useBoolean(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // const showVizSwapper = useMemo(() => {
  //   if (config.viz_swapping_dashboards && selected_dashboard_id) {
  //     return config.viz_swapping_dashboards.includes(selected_dashboard_id);
  //   }
  //   return false;
  // }, [config.viz_swapping_dashboards, selected_dashboard_id]);

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


function updateDashboardLayout(data, layoutType) {
    // Find the currently active layout, or default to the first layout if no 'active' property
    const activeLayout = data.layouts.find(layout => layout.active) || data.layouts[0];

    // Check if a layout and its components exist
    if (!activeLayout || !activeLayout.dashboard_layout_components) {
        console.error("Dashboard layout or its components not found in the provided data.");
        return data; // Return the original data if the structure is not as expected
    }

    // Update the 'type' property of the layout itself
    activeLayout.type = 'newspaper';

    // Apply layout-specific changes to each component
    if (layoutType === "newspaper") {
        // Newspaper layout: 1 column
        activeLayout.dashboard_layout_components.forEach(component => {
            component.column = 0;   // All components start at the first column
            component.width = 24;   // All components span the full width
        });
        console.log("Layout updated to 'newspaper' (1-column).");
    } else if (layoutType === "grid") {
        // Grid layout: 4 columns
        const columnWidth = 6; // Total width (24) / 4 columns = 6 units per column
        const columnPositions = [0, 6, 12, 18]; // Starting positions for each of the 4 columns
        let columnIndex = 0; // Index to cycle through column positions

        activeLayout.dashboard_layout_components.forEach(component => {
            // Assign a column position by cycling through 0, 6, 12, 18
            component.column = columnPositions[columnIndex % columnPositions.length];
            component.width = columnWidth; // Each component spans 6 units
            component.height = 6;
            columnIndex++;
        });
        console.log("Layout updated to 'grid' (4-column).");
    } else {
        console.warn(`Unknown layout type: "${layoutType}". No changes were applied to the components.`);
    }
    console.log(data)
    return data; // Return the modified data object
}

  useEffect(() => {
    if(!dashboard || !config || !dashboardLayout?.layouts) return;

    // if (!showVizSwapper) {
    //   dashboard.asDashboardConnection().setOptions({
    //     ...dashboardLayout
    //   })
    //   return;
    // }

    dashboard.asDashboardConnection().setOptions({
      ...updateDashboardLayout(dashboardLayout, config.layout)
    })

  },[config.layout, dashboard, dashboardLayout])

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
          .on("dashboard:loaded", (e) => {
            console.log(e.dashboard.options)
            setDashboardLayout(e.dashboard.options)
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
      selected_dashboard_id
    ]
  );
  return (
    <>
    <StyledCard
      raised
      borderRadius="large"
      ref={dashboardRef}
      iframe_visible={iframe_visible.value}
      >
    </StyledCard>
    <VizSwapper />
    </>
  );
};

export default Dashboard;
