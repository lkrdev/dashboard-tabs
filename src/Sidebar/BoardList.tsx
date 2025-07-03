import {
  Divider,
  List,
  ListItem,
  SpaceVertical,
  Span,
} from "@looker/components";
import React, { useMemo } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useAppContext } from "../AppContext";
import Skeleton from "../components/Skeleton";
import useSdk from "../hooks/useSdk";
import { getBoardList, IBoardList } from "../utils/getBoardList";

const DashboardItem = ({ id }: IBoardList) => {
  const { changeDashboardId, selected_dashboard_id } = useAppContext();
  const sdk = useSdk();
  const db = useSWR(`dashboard-${id}`, () =>
    sdk.ok(sdk.dashboard(id, "id,title"))
  );
  return (
    <ListItem
      selected={selected_dashboard_id === id}
      onClick={() => {
        changeDashboardId(id);
      }}
      itemRole="link"
    >
      {db.isLoading ? (
        <Skeleton show={true} width="100%" color="transparent" height="100%">
          Loading...
        </Skeleton>
      ) : (
        <>{db.data?.title}</>
      )}
    </ListItem>
  );
};

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
        <Span fontSize="small" fontWeight={"bold"}>
          {title}
        </Span>
        <Span fontSize="xsmall">{description}</Span>
      </SpaceVertical>
    </>
  );
};

const BoardList: React.FC = () => {
  const { board_id } = useAppContext();
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

  return (
    <List>
      {list.map((item) => {
        if (item.type === "dashboard") {
          return <DashboardItem key={`dashboard-${item.id}`} {...item} />;
        } else {
          return <SectionItem key={`section-${item.id}`} {...item} />;
        }
      })}
    </List>
  );
};

export default BoardList;
