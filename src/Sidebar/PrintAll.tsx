import { Box, Button, Span } from "@looker/components";
import { IDashboard } from "@looker/sdk";
import React, { useEffect, useRef } from "react";
import useSWR, { State, useSWRConfig } from "swr";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "../AppContext";
import ProgressIndicator from "../components/ProgressIndicator";
import useConfigContext from "../ConfigContext";
import useExtensionSdk from "../hooks/useExtensionSdk";
import useSdk from "../hooks/useSdk";
import { getBoardList } from "../utils/getBoardList";

const getDashboardRenderUrl = (
  dashboard_id: string,
  filename: string,
  filters: Record<string, string>
) => {
  const now = new Date();

  const path = `/render/process/wd/1680/1/dashboards/${dashboard_id}.pdf`;
  const query_params = {
    filename: `${filename}_${now.toLocaleDateString()}`,
    longTables: "false",
    title: filename,
    pdf_landscape: "false",
    pdf_paper_size: "fitPageToDashboard",
    print_mode: "true",
    ...filters,
  };
  return `${path}?${new URLSearchParams(query_params).toString()}`;
};

export const PrintAll = () => {
  const { cache } = useSWRConfig();
  const extension_sdk = useExtensionSdk();

  const running = useBoolean(false);
  const done = useBoolean(false);
  const doneTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { folder_id, board_id, adhoc_dashboard_ids } = useAppContext();
  const { config: config_data } = useConfigContext();
  const { getSearchParams } = useAppContext();
  const sdk = useSdk();

  const folder_dashboards = useSWR(
    folder_id?.length ? `folder-dashboards-${folder_id}` : null,
    () => sdk.ok(sdk.folder_dashboards(folder_id!, "id"))
  );
  const board = useSWR(board_id?.length ? `board-${board_id}` : null, () =>
    sdk.ok(sdk.board(board_id!))
  );

  const handlePrintAll = async () => {
    running.setTrue();
    let dashboard_ids: string[] = config_data.dashboards || [];
    if (folder_id) {
      dashboard_ids = folder_dashboards.data?.map((db) => db.id!) || [];
    } else if (board_id) {
      if (!board.data) {
        dashboard_ids = [];
      } else {
        const list = getBoardList(board.data);
        dashboard_ids = list
          .filter((item) => item.type === "dashboard")
          .map((item) => item.id);
      }
    } else if (adhoc_dashboard_ids?.length) {
      dashboard_ids = adhoc_dashboard_ids;
    }

    if (dashboard_ids.length === 0) {
      console.warn("No dashboard IDs found in configuration");
      return;
    }
    // Loop through all dashboard IDs and open them in new tabs
    for (const dashboard_id of dashboard_ids) {
      const cached_data = cache.get(`dashboard-${dashboard_id}`) as
        | State<IDashboard>
        | undefined;
      const filename = cached_data?.data?.title?.length
        ? cached_data.data.title
        : `dashboard_${dashboard_id}`;
      const url = getDashboardRenderUrl(
        dashboard_id,
        filename + ".pdf",
        getSearchParams(true)
      );
      const test = extension_sdk.openBrowserWindow(url, "_blank");
    }
    done.setTrue();
    doneTimeoutRef.current = setTimeout(() => {
      done.setFalse();
    }, 10000);
    running.setFalse();
  };

  useEffect(() => {
    return () => {
      if (doneTimeoutRef.current) {
        clearTimeout(doneTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box flexGrow={1} width="100%">
      <Button
        fullWidth
        onClick={handlePrintAll}
        disabled={running.value || done.value}
        color="neutral"
      >
        Print All Dashboards
      </Button>
      <ProgressIndicator show={running.value} width="100%" />
      {done.value && (
        <Span fontSize={"xxsmall"}>
          Please make sure your browser did not block the print tabs from
          opening
        </Span>
      )}
    </Box>
  );
};
