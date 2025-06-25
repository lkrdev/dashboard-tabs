import {
  Box,
  ButtonOutline,
  InputSearch,
  NavTree,
  NavTreeItem,
  Popover,
  PopoverLayout,
  SpaceVertical,
  Span,
  Tab2,
  Tabs2,
} from "@looker/components";
import React, { useState } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useBoolean, useDebounceValue } from "usehooks-ts";
import { useAppContext } from "../AppContext";
import ProgressIndicator from "../components/ProgressIndicator";
import useExtensionSdk from "../hooks/useExtensionSdk";
import useSdk from "../hooks/useSdk";

const StyledNavTreeItem = styled(NavTreeItem)`
  &.folder-tree-item div:last-child {
    padding-right: 0px !important;
  }
  width: 100%;
`;

const FolderTree: React.FC<{
  folder_id: string;
  default_open: boolean;
}> = ({ folder_id, default_open }) => {
  const sdk = useSdk();
  const extensionSdk = useExtensionSdk();
  const folder = useSWR(folder_id?.length ? `folder-${folder_id}` : null, () =>
    sdk.ok(sdk.folder(folder_id!, "id,name,dashboards(id,title)"))
  );

  const children_folders = useSWR(
    folder_id?.length ? `children-folders-${folder_id}` : null,
    () =>
      sdk.ok(
        sdk.search_folders({
          parent_id: folder_id!,
          fields: "id,name,dashboards(id,title)",
        })
      )
  );

  if (children_folders.isLoading || folder.isLoading) {
    return <></>;
  } else if (children_folders.data?.length) {
    return (
      <NavTree
        style={{ width: "100%" }}
        label={folder.data?.name!}
        defaultOpen={default_open}
        indicatorLabel="Open Children"
        href="#"
        target="_self"
        onClick={() => {
          extensionSdk.updateLocation(
            `/extensions/${extensionSdk.lookerHostData?.extensionId}/folders/${folder.data?.id}`,
            {},
            "_self"
          );
        }}
        detail={
          folder.data?.dashboards?.length
            ? `${folder.data?.dashboards?.length} dashboards`
            : ""
        }
      >
        {children_folders.data?.map((folder) => (
          <FolderTree
            key={folder.id}
            folder_id={folder.id!}
            default_open={false}
          />
        ))}
      </NavTree>
    );
  } else {
    return (
      <StyledNavTreeItem
        className="folder-tree-item"
        value={folder.data?.id!}
        detail={`${folder.data?.dashboards?.length} dashboards`}
        onClick={() => {
          extensionSdk.updateLocation(
            `/extensions/${extensionSdk.lookerHostData?.extensionId}/folders/${folder.data?.id}`,
            {},
            "_self"
          );
        }}
      >
        {folder.data?.name!}
      </StyledNavTreeItem>
    );
  }
};

const FolderNavigation: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debounced_search, setDebouncedSearch] = useDebounceValue(search, 500);

  const { me } = useAppContext();
  const sdk = useSdk();
  const open = useBoolean(false);

  const my_personal_folder = useSWR(
    me?.id && open.value ? `my-personal-folders-${me?.id}` : null,
    () => sdk.ok(sdk.folder("personal", "id,name,dashboards(id,title)"))
  );

  const debounced_search_folders = useSWR(
    debounced_search?.length && open.value
      ? `search-folders-${debounced_search}`
      : null,
    () =>
      sdk.ok(
        sdk.search_folders({
          name: "%" + debounced_search!.replace(/\s/g, "%") + "%",
          fields: "id,name,dashboards(id,title)",
          limit: 10,
          offset: 0,
          sorts: "name asc",
        })
      )
  );

  return (
    <Popover
      isOpen={open.value}
      placement="right"
      onClose={() => {
        open.setFalse();
        setSearch("");
        setDebouncedSearch("");
      }}
      content={
        <PopoverLayout header="Open Folders" footer={false}>
          <Box style={{ height: "600px", width: "600px" }}>
            <Tabs2>
              <Tab2 value="my_personal_folder" label="My Personal Folder">
                <FolderTree
                  folder_id={my_personal_folder?.data?.id!}
                  default_open={true}
                />
              </Tab2>
              <Tab2 value="shared_folder" label="Shared Folder">
                <FolderTree folder_id={"1"} default_open={true} />
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
                  <ProgressIndicator
                    show={debounced_search_folders.isLoading}
                  />
                  {!debounced_search_folders.data?.length &&
                  !debounced_search_folders.isLoading &&
                  debounced_search.length ? (
                    <Span>No folders found</Span>
                  ) : null}
                  {!!debounced_search_folders.data?.length && (
                    <SpaceVertical gap="none" width="100%">
                      {debounced_search_folders.data?.map((folder) => (
                        <FolderTree
                          key={folder.id}
                          folder_id={folder.id!}
                          default_open={false}
                        />
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
      <ButtonOutline onClick={open.setTrue} fullWidth>
        {"Open Folder"}
      </ButtonOutline>
    </Popover>
  );
};

export default FolderNavigation;
