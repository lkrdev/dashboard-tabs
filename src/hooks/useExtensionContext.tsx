import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../AppContext";
import useExtensionSdk from "./useExtensionSdk";

export interface IExtensionContextData {
  dashboards?: string[];
  setting_group_ids?: string[];
  restrict_settings?: boolean;
  print_all_dashboards?: boolean;
  label?: string;
  enable_folder_navigation?: boolean;
  enable_board_navigation?: boolean;
}

// Efficient intersection function using Set for O(n) performance
const intersection = (arr1: string[], arr2: string[]): string[] => {
  const set1 = new Set(arr1);
  return arr2.filter((item) => set1.has(item));
};

export const useExtensionContextData = () => {
  const extension_sdk = useExtensionSdk();
  const [config_data, setConfigData] = useState<IExtensionContextData>({});
  const { is_admin, me } = useAppContext();

  useEffect(() => {
    const config_data: IExtensionContextData = extension_sdk.getContextData();
    setConfigData(config_data || {});
  }, [extension_sdk]);

  const checkCurrentUserCanUpdateSettings = (group_ids: string[]) => {
    return intersection(group_ids, me?.group_ids || []).length > 0;
  };

  const can_update_settings = useMemo(() => {
    if (!config_data.restrict_settings) {
      return true;
    } else if (is_admin) {
      return true;
    } else {
      return checkCurrentUserCanUpdateSettings(
        config_data.setting_group_ids || []
      );
    }
  }, [
    is_admin,
    me,
    config_data.restrict_settings,
    config_data.setting_group_ids,
  ]);

  const updateValues = (values: Partial<IExtensionContextData>) => {
    if (!can_update_settings) {
      console.error("You are not allowed to update the settings");
      return;
    }
    let current: IExtensionContextData = extension_sdk.getContextData();
    for (const [key, value] of Object.entries(values)) {
      const casted_key = key as keyof IExtensionContextData;
      if (value === undefined || value === null || value === "") {
        delete current[casted_key];
      } else {
        current[casted_key] = value as any;
      }
    }
    setConfigData(current);
    extension_sdk.saveContextData(current);
    extension_sdk.refreshContextData();
  };

  return {
    config_data,
    updateValues,
    checkCurrentUserCanUpdateSettings,
    can_update_settings,
  };
};
