import {
  Box,
  ButtonOutline,
  InputSearch,
  List,
  ListItem,
  Popover,
  PopoverLayout,
  SpaceVertical,
  Span,
  Tab2,
  Tabs2,
} from "@looker/components";
import { IBoard } from "@looker/sdk";
import React, { useState } from "react";
import useSWR from "swr";
import { useBoolean, useDebounceValue } from "usehooks-ts";
import ProgressIndicator from "../components/ProgressIndicator";
import useExtensionSdk from "../hooks/useExtensionSdk";
import useSdk from "../hooks/useSdk";

const BoardItem: React.FC<{ board: IBoard }> = ({ board }) => {
  const extensionSdk = useExtensionSdk();
  const number_of_dashboards = board.board_sections?.reduce((acc, section) => {
    if (section.board_items?.length) {
      section.board_items.map((item) => {
        if (item.dashboard_id) {
          acc++;
        }
      });
    }
    return acc;
  }, 0);
  return (
    <ListItem
      fullWidth
      style={{ width: "100%" }}
      density={-2}
      detail={number_of_dashboards ? `${number_of_dashboards} dashboards` : ""}
      description={board.description}
      onClick={() => {
        extensionSdk.updateLocation(
          `/extensions/${extensionSdk.lookerHostData?.extensionId}/boards/${board.id}`,
          {},
          "_self"
        );
      }}
    >
      {board.title}
    </ListItem>
  );
};

const BoardNavigation: React.FC = () => {
  const sdk = useSdk();
  const is_open = useBoolean(false);
  const [search, setSearch] = useState("");
  const [debounced_search, setDebouncedSearch] = useDebounceValue(search, 500);

  const favorite_boards = useSWR(is_open.value ? "favorite_boards" : null, () =>
    sdk.ok(
      sdk.search_boards({
        favorited: true,
        fields: "id,title,description,board_sections(board_items)",
      })
    )
  );

  const debounced_search_boards = useSWR(
    is_open.value ? `search-boards-${debounced_search}` : null,
    () =>
      sdk.ok(
        sdk.search_boards({
          title: "%" + debounced_search!.replace(/\s/g, "%") + "%",
          fields: "id,title,description,board_sections(board_items)",
          limit: 20,
          offset: 0,
          sorts: "title asc",
        })
      )
  );

  return (
    <Popover
      placement="right"
      isOpen={is_open.value}
      onClose={() => {
        is_open.setFalse();
        setSearch("");
        setDebouncedSearch("");
      }}
      content={
        <PopoverLayout header="Boards" footer={false}>
          <Box height="400px" width="600px">
            <Tabs2>
              <Tab2 value="favorites" label="My Boards">
                <List>
                  {favorite_boards.data?.map((board) => (
                    <BoardItem key={board.id} board={board} />
                  ))}
                </List>
              </Tab2>
              <Tab2 value="search" label="Search">
                <SpaceVertical gap="xsmall" width="100%">
                  <InputSearch
                    autoFocus
                    value={search}
                    placeholder="Search for a folder"
                    onChange={(value) => {
                      setSearch(value);
                      setDebouncedSearch(value.toLowerCase());
                    }}
                  />
                  <ProgressIndicator show={debounced_search_boards.isLoading} />
                  {!debounced_search_boards.data?.length &&
                  !debounced_search_boards.isLoading &&
                  debounced_search.length ? (
                    <Span>No boards found</Span>
                  ) : null}
                  {!!debounced_search_boards.data?.length && (
                    <SpaceVertical gap="none" width="100%">
                      {debounced_search_boards.data?.map((board) => (
                        <BoardItem key={board.id} board={board} />
                      ))}
                    </SpaceVertical>
                  )}
                </SpaceVertical>
              </Tab2>
            </Tabs2>
          </Box>
        </PopoverLayout>
      }
    >
      <ButtonOutline fullWidth onClick={() => is_open.setTrue()}>
        Open Board
      </ButtonOutline>
    </Popover>
  );
};

export default BoardNavigation;
