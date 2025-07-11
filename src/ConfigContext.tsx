import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAppContext } from "./AppContext";
import useExtensionSdk from "./hooks/useExtensionSdk";
import {
  DEFAULT_DASHBOARD_BACKGROUND_COLOR,
  DEFAULT_DASHBOARD_PAPER_COLOR,
} from "./utils/constants";

type TConfigContext = {
  config: IExtensionConfig;
  updateConfig: (config: IExtensionConfig) => void;
  can_update_settings: boolean;
  checkCurrentUserCanUpdateSettings: (group_ids: string[]) => boolean;
};

// Efficient intersection function using Set for O(n) performance
const intersection = (arr1: string[], arr2: string[]): string[] => {
  const set1 = new Set(arr1);
  return arr2.filter((item) => set1.has(item));
};

export interface IExtensionConfig {
  dashboards?: string[];
  setting_group_ids?: string[];
  restrict_settings?: boolean;
  label?: string;
  remove_branded_loading?: boolean;
  print_all_dashboards?: boolean;
  enable_folder_navigation?: boolean;
  enable_board_navigation?: boolean;
  allow_adhoc_dashboards?: boolean;
  save_board_from_adhoc_dashboards?: boolean;
  background_color?: string;
  paper_color?: string;
}

export const ConfigContext = createContext<TConfigContext>({} as any);

const useConfigContext: () => TConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error(
      "useConfigContext must be used within a ConfigContextProvider"
    );
  }
  return context;
};

const ConfigContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const extension_sdk = useExtensionSdk();
  const [config_data, setConfigData] = useState<IExtensionConfig>({});
  const { is_admin, me, updateDashboardTheme } = useAppContext();

  useEffect(() => {
    const config_data: IExtensionConfig = extension_sdk.getContextData();
    setConfigData(config_data ?? {});
  }, [extension_sdk]);

  // Computed property that provides defaulted boolean values
  const config_data_with_defaults = useMemo(
    () => ({
      ...config_data,
      remove_branded_loading: config_data.remove_branded_loading ?? false,
      print_all_dashboards: config_data.print_all_dashboards ?? true,
      enable_folder_navigation: config_data.enable_folder_navigation ?? true,
      enable_board_navigation: config_data.enable_board_navigation ?? true,
      allow_adhoc_dashboards: config_data.allow_adhoc_dashboards ?? true,
      save_board_from_adhoc_dashboards:
        config_data.save_board_from_adhoc_dashboards ?? true,
      background_color:
        config_data.background_color ?? DEFAULT_DASHBOARD_BACKGROUND_COLOR,
      paper_color: config_data.paper_color ?? DEFAULT_DASHBOARD_PAPER_COLOR,
    }),
    [config_data]
  );

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

  const updateValues = (values: Partial<IExtensionConfig>) => {
    if (!can_update_settings) {
      console.error("You are not allowed to update the settings");
      return;
    }
    let current: IExtensionConfig = extension_sdk.getContextData() || {};
    for (const [key, value] of Object.entries(values)) {
      const casted_key = key as keyof IExtensionConfig;
      if (value === undefined || value === null || value === "") {
        delete current[casted_key];
      } else {
        current[casted_key] = value as any;
      }
    }
    setConfigData({ ...current });
    updateDashboardTheme(current);
    extension_sdk.saveContextData(current);
    extension_sdk.refreshContextData();
  };
  return (
    <ConfigContext.Provider
      value={{
        config: config_data_with_defaults,
        updateConfig: updateValues,
        can_update_settings,
        checkCurrentUserCanUpdateSettings,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export default useConfigContext;
export { ConfigContextProvider };
