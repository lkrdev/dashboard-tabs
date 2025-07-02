import { ILookerConnection } from "@looker/embed-sdk";
import { IUser } from "@looker/sdk";
import React, { createContext, useContext, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import useSWR from "swr";
import { ToastProvider } from "./components/Toast/ToastContext";
import useSdk from "./hooks/useSdk";
import useSearchParams from "./hooks/useSearchParams";
import { THEME } from "./utils/constants";

export type GlobalFilters = { [key: string]: string };

interface AppContextType {
  isLoading: boolean;
  me: IUser | undefined;
  dashboard: ILookerConnection | undefined;
  setDashboard: React.Dispatch<
    React.SetStateAction<ILookerConnection | undefined>
  >;
  global_filters: GlobalFilters;
  updateGlobalFilters: (filters: GlobalFilters) => void;
  folder_id?: string;
  board_id?: string;
  selected_dashboard_id?: string;
  changeDashboardId: (id: string | null, skip_load?: boolean) => void;
  is_admin: boolean;
  adhoc_dashboard_ids?: string[];
  toggleAdhocDashboardId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { search_params, updateSearchParams } = useSearchParams();
  const sdk = useSdk();
  const { data: me, isLoading, error } = useSWR("me", () => sdk.ok(sdk.me()));
  const [dashboard, setDashboard] = React.useState<ILookerConnection>();
  const [global_filters, setGlobalFilters] =
    React.useState<GlobalFilters>(search_params);
  const [selected_dashboard_id, setSelectedDashboardId] = React.useState<
    string | undefined
  >(search_params.dashboard_id);

  const location = useLocation();
  const history = useHistory();
  const folder_id = location.pathname.startsWith("/folders/")
    ? location.pathname.split("/")[2]
    : undefined;

  const board_id = location.pathname.startsWith("/boards/")
    ? location.pathname.split("/")[2]
    : undefined;

  const adhoc_dashboard_ids = useMemo(() => {
    if (
      location.pathname.endsWith("/dashboards") ||
      location.pathname.startsWith("/dashboards/")
    ) {
      return location.pathname.split("/").slice(2) || [];
    } else {
      return undefined;
    }
  }, [location.pathname]);

  const is_admin = useMemo(() => {
    return Boolean(me?.role_ids?.includes("2"));
  }, [me]);

  const changeDashboardId = (id: string | null, skip_load: boolean = false) => {
    if (id) {
      setSelectedDashboardId(id);
      updateSearchParams({ dashboard_id: id });
    } else {
      setSelectedDashboardId(undefined);
      updateSearchParams({ dashboard_id: undefined });
    }
    if (skip_load) {
      return;
    } else {
      if (id) {
        dashboard?.loadDashboard(
          id +
            "?" +
            Object.entries({ ...global_filters, ...THEME })
              .map(([key, value]) => `${key}=${value}`)
              .join("&")
        );
      } else {
        dashboard?.preload();
      }
    }
  };

  const toggleAdhocDashboardId = (id: string) => {
    let extension_path = new Set(location.pathname.split("/").splice(2) || []);
    const on_path = extension_path.has(id);
    const { dashboard_id, ...original_search_params } = search_params;
    const new_search = new URLSearchParams(original_search_params);
    if (on_path) {
      extension_path.delete(id);
    } else {
      extension_path.add(id);
      new_search.set("dashboard_id", id);
    }

    if (extension_path.size === 0) {
      history.push(`/dashboards?${new_search.toString()}`);
      setDashboard(undefined);
    } else {
      const current = new_search.get("dashboard_id");
      const current_on_path = current && extension_path.has(current);
      if (current_on_path) {
        changeDashboardId(current);
      } else {
        const first_id = Array.from(extension_path)[0];
        // new_search.set("dashboard_id", first_id);
        changeDashboardId(first_id);
      }
    }

    history.push(
      `/dashboards${
        extension_path.size > 0
          ? "/" + Array.from(extension_path).join("/")
          : ""
      }?${new_search.toString()}`
    );
  };

  const updateGlobalFilters = (filters: GlobalFilters) => {
    const { dashboard_id, _theme, ...new_filters } = {
      ...global_filters,
      ...filters,
    };
    setGlobalFilters(new_filters);
    updateSearchParams(new_filters);
  };

  return (
    <AppContext.Provider
      value={{
        me,
        isLoading,
        dashboard,
        setDashboard,
        global_filters,
        updateGlobalFilters,
        folder_id,
        board_id,
        selected_dashboard_id,
        changeDashboardId,
        is_admin,
        adhoc_dashboard_ids,
        toggleAdhocDashboardId,
      }}
    >
      <ToastProvider>{children}</ToastProvider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
