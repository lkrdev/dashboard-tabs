import { Divider, List, SpaceVertical, Span } from "@looker/components";
import React, { useMemo } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useAppContext } from "../AppContext";
import useConfigContext from "../ConfigContext";
import useSdk from "../hooks/useSdk";
import {
  getBoardList,
  groupBoardForHorizon,
  IBoardList,
} from "../utils/getBoardList";
import DashboardItem from "./DashboardItem";

const StyledDivider = styled(Divider)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  &:first-child {
    display: none;
    margin-bottom: 0;
  }
`;

const SectionItem = ({ title, description }: IBoardList) => {
  if (title === "Section") {
    return null;
  }
  return (
    <>
      <StyledDivider />
      <SpaceVertical
        mb="xsmall"
        gap="none"
        as="li"
        style={{ userSelect: "none" }}
      >
        <Span fontSize="small" fontWeight={"bold"} color="text">
          {title}
        </Span>
        <Span fontSize="xsmall" color="text">
          {description}
        </Span>
      </SpaceVertical>
    </>
  );
};

const BoardList: React.FC = () => {
  const { board_id } = useAppContext();
  const { config } = useConfigContext();
  const sdk = useSdk();
  const board = useSWR(board_id?.length ? `board-${board_id}` : null, () =>
    sdk.ok(sdk.board(board_id!))
  );

  const list = useMemo(() => {
    if (!board.data) {
      return [] as IBoardList[];
    }
    return getBoardList(board.data);
  }, [board.data]);

  const horizonGroups = useMemo(
    () => groupBoardForHorizon(list, board.data?.description).groups,
    [list, board.data?.description]
  );

  const renderDashboard = (item: IBoardList) => (
    <DashboardItem
      key={`dashboard-${item.id}`}
      dashboard_id={item.id}
      fallback_title={item.title}
      from_board
    />
  );

  if (config.theme === "horizon") {
    return (
      <div className="hz-stack">
        {horizonGroups.map((group) => (
          <div className="hz-pod" key={`pod-${group.id}`}>
            {group.title && (
              <div className="hz-pod-top">
                <span className="hz-pod-name">{group.title}</span>
                <span className="hz-pod-cnt">{group.items.length}</span>
              </div>
            )}
            {group.items.map(renderDashboard)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <List style={{ overflow: "auto" }}>
      {list.map((item) =>
        item.type === "dashboard" ? (
          renderDashboard(item)
        ) : (
          <SectionItem key={`section-${item.id}`} {...item} />
        )
      )}
    </List>
  );
};

export default BoardList;
