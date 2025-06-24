import {
  ButtonOutline,
  Dialog,
  DialogContent,
  DialogHeader,
  InputSearch,
} from "@looker/components";
import React from "react";
import { useBoolean, useDebounceValue } from "usehooks-ts";
import { DASHBOARD_ID_KEY } from "./utils/constants";
import useExtensionSdk from "./hooks/useExtensionSdk";
import { useState } from "react";
import { Space, Label, InputChips } from "@looker/components";
import useSWR from "swr";
import useSdk from "./hooks/useSdk";

const Settings: React.FC = () => {
  const [debounced_search, setDebouncedSearch] = useDebounceValue("", 500)
  const sdk = useSdk();
  const searched_dashboards = useSWR(
    `debounced_search=${debounced_search}`,
    () =>
      sdk.ok(
        sdk.search_dashboards({
          limit: 50,
          title: debounced_search?.length ? `%${debounced_search}%` : undefined,
          sorts: 'title'
        }),
      )
  )
  const extension_sdk = useExtensionSdk();
  const config_data = extension_sdk.getContextData();
  const [dashboard_ids, setDashboardIds] = useState<string[]>(
    config_data?.[DASHBOARD_ID_KEY] || []
  );

  const handleChange = async (values: string[]) => {
    setDashboardIds(values);
    await extension_sdk.saveContextData({
      [DASHBOARD_ID_KEY]: values,
    });
    await extension_sdk.refreshContextData();
  };
  const open = useBoolean(false);

  return (
    <>
      <ButtonOutline onClick={() => open.setTrue()}>Settings</ButtonOutline>
      <Dialog
        isOpen={open.value}
        onClose={async () => {
          open.setFalse();
        }}
      >
        <DialogHeader>Settings</DialogHeader>
        <DialogContent minHeight={"400px"}>
          <Space>
            <Label>Dashboard IDs for the tabs</Label>
            <InputChips
              placeholder="Dashboard IDs"
              values={dashboard_ids}
              onChange={handleChange}
            />
          </Space>
          <InputSearch
            options={searched_dashboards.data?.map(d => ({ value: d.id!, label: d.title! }))}
            onChange={(value: string) => setDebouncedSearch(value)}
            onSelectOption={(v) => handleChange([...dashboard_ids, v!.value])}
            changeOnSelect={false}
            placeholder="Search and click to add"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;
