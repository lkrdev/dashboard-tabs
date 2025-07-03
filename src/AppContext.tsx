import { ILookerConnection } from "@looker/embed-sdk";
import { IUser } from "@looker/sdk";
import React, { createContext, useContext, useMemo, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import useSWR from "swr";
import { ToastProvider } from "./components/Toast/ToastContext";
import useSdk from "./hooks/useSdk";

export type GlobalFilters = { [key: string]: string };

interface AppContextType {
  isLoading: boolean;
  me: IUser | undefined;
  dashboard: ILookerConnection | undefined;
  setDashboard: React.Dispatch<
    React.SetStateAction<ILookerConnection | undefined>
  >;
  updateGlobalFilters: (filters: GlobalFilters) => void;
  folder_id?: string;
  board_id?: string;
  selected_dashboard_id?: string;
  changeDashboardId: (id: string | null, skip_load?: boolean) => void;
  is_admin: boolean;
  adhoc_dashboard_ids?: string[];
  toggleAdhocDashboardId: (id: string) => void;
  current_search_ref: React.MutableRefObject<Record<string, string>>;
  getSearchParams: (global_filters?: boolean) => Record<string, string>;
  updateSearchParams: (
    params: Record<string, string | undefined | null>,
    global_filters?: boolean
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const sdk = useSdk();
  const { data: me, isLoading, error } = useSWR("me", () => sdk.ok(sdk.me()));
  const [dashboard, setDashboard] = React.useState<ILookerConnection>();
  const current_search_ref = useRef(
    Object.fromEntries(new URLSearchParams(location.search))
  );
  const [selected_dashboard_id, setSelectedDashboardId] = React.useState<
    string | undefined
  >(current_search_ref.current.dashboard_id);

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

  const getSearchParams = (global_filters?: boolean) => {
    if (global_filters) {
      const { dashboard_id, sandboxed_host, sdk, _theme, ...global_filters } =
        current_search_ref.current;
      return global_filters;
    } else {
      return current_search_ref.current;
    }
  };

  const updateSearchParams = (
    params: Record<string, string | undefined | null>
  ) => {
    const new_params = new URLSearchParams({
      ...getSearchParams(false),
    });
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        new_params.delete(key);
      } else {
        new_params.set(key, value);
      }
    });
    current_search_ref.current = Object.fromEntries(new_params);
    history.push({ search: new_params.toString() });
  };

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
            Object.entries(current_search_ref.current)
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
    const new_search = new URLSearchParams(current_search_ref.current);
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
    updateSearchParams(filters);
  };

  return (
    <AppContext.Provider
      value={{
        me,
        isLoading,
        dashboard,
        setDashboard,
        updateGlobalFilters,
        folder_id,
        board_id,
        selected_dashboard_id,
        changeDashboardId,
        is_admin,
        adhoc_dashboard_ids,
        toggleAdhocDashboardId,
        current_search_ref,
        getSearchParams,
        updateSearchParams,
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
