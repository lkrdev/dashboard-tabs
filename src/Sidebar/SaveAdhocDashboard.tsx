import {
  ButtonOutline,
  ButtonTransparent,
  InputSearch,
  MenuItem,
  MenuList,
  Popover,
  PopoverLayout,
  SpaceVertical,
} from "@looker/components";
import React from "react";
import { useHistory } from "react-router-dom";
import useSWR from "swr";
import { useDebounceValue } from "usehooks-ts";
import { useAppContext } from "../AppContext";
import ProgressIndicator from "../components/ProgressIndicator";
import useSdk from "../hooks/useSdk";

const AdhocDashboard: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [debounced_search, setDebouncedSearch] = useDebounceValue("", 500);
  const sdk = useSdk();
  const history = useHistory();
  const { toggleAdhocDashboardId, changeDashboardId, adhoc_dashboard_ids } =
    useAppContext();

  const searched_dashboards = useSWR(
    `debounced-dashboard-search-${debounced_search}`,
    () =>
      sdk.ok(
        sdk.search_dashboards({
          limit: 10,
          title: debounced_search?.length
            ? `%${debounced_search!.replace(/\s/g, "%")}%`
            : undefined,
          sorts: "title",
        })
      )
  );

  return (
    <Popover
      placement="right-start"
      content={
        <PopoverLayout
          header="Add Dashboard"
          closeButton={
            <ButtonTransparent
              color="neutral"
              size="xsmall"
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                history.push("/dashboards");
                changeDashboardId(null);
              }}
            >
              Reset
            </ButtonTransparent>
          }
        >
          <SpaceVertical gap="xsmall" height="500px" width="300px">
            <InputSearch
              value={search}
              autoFocus={true}
              open={true}
              onChange={(value: string) => {
                setSearch(value);
                setDebouncedSearch(value);
              }}
              changeOnSelect={false}
            />
            <ProgressIndicator show={searched_dashboards.isLoading} />
            <MenuList>
              {searched_dashboards.data?.map((d) => (
                <MenuItem
                  key={d.id}
                  description={d.description}
                  detail={d.folder?.name}
                  disabled={adhoc_dashboard_ids?.includes(d.id!)}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleAdhocDashboardId(d.id!);
                  }}
                >
                  {d.title || d.id!}
                </MenuItem>
              ))}
            </MenuList>
          </SpaceVertical>
        </PopoverLayout>
      }
    >
      <ButtonOutline style={{ flexGrow: 1 }}>Save as Board</ButtonOutline>
    </Popover>
  );
};

export default AdhocDashboard;
