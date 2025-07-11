import { IconButton, ListItem } from "@looker/components";
import { Delete } from "@styled-icons/material";
import React from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useAppContext } from "../AppContext";
import Skeleton from "../components/Skeleton";
import useConfigContext from "../ConfigContext";
import useSdk from "../hooks/useSdk";
import { adjustColorLightness } from "../utils/colorUtils";

const StyledListItem = styled(ListItem)<{ paperColor?: string }>`
  & > a {
    background-color: ${({ paperColor, selected }) =>
      selected ? adjustColorLightness(paperColor, 0.1) : paperColor};
  }
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

const DashboardItem = ({ dashboard_id }: { dashboard_id: string }) => {
  const {
    selected_dashboard_id,
    adhoc_dashboard_ids,
    changeDashboardId,
    toggleAdhocDashboardId,
  } = useAppContext();
  const {
    config: { paper_color },
  } = useConfigContext();
  const sdk = useSdk();
  const db = useSWR(`dashboard-${dashboard_id}`, () =>
    sdk.ok(sdk.dashboard(dashboard_id, "id,title"))
  );
  const is_adhoc = Boolean(adhoc_dashboard_ids);
  return (
    <StyledListItem
      paperColor={paper_color}
      itemRole="link"
      selected={selected_dashboard_id === dashboard_id}
      onClick={() => {
        changeDashboardId(dashboard_id);
      }}
      detail={
        is_adhoc ? (
          <IconButton
            className="remove-button"
            icon={<Delete />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              e.preventDefault();
              toggleAdhocDashboardId(dashboard_id);
            }}
            label="Remove"
          />
        ) : null
      }
    >
      {db.isLoading ? (
        <Skeleton show={true} width="100%" color="transparent" height="100%">
          Loading...
        </Skeleton>
      ) : (
        <>{db.data?.title || dashboard_id}</>
      )}
    </StyledListItem>
  );
};

export default DashboardItem;
