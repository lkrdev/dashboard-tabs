import { ILookerConnection } from "@looker/embed-sdk";
import { IUser } from "@looker/sdk";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import { ToastProvider } from "./components/Toast/ToastContext";
import useSdk from "./hooks/useSdk";
import useSearchParams from "./hooks/useSearchParams";

type GlobalFilters = { [key: string]: string };

interface AppContextType {
  isLoading: boolean;
  me: IUser | undefined;
  dashboard: ILookerConnection | undefined;
  setDashboard: React.Dispatch<
    React.SetStateAction<ILookerConnection | undefined>
  >;
  global_filters: GlobalFilters;
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  folder_id?: string;
  board_id?: string;
  selected_dashboard_id?: string;
  changeDashboardId: (id: string, skip_load?: boolean) => void;
  is_admin: boolean;
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
  const folder_id = location.pathname.startsWith("/folders/")
    ? location.pathname.split("/")[2]
    : undefined;

  const board_id = location.pathname.startsWith("/boards/")
    ? location.pathname.split("/")[2]
    : undefined;

  useEffect(() => {
    updateSearchParams(global_filters);
  }, [global_filters]);

  const is_admin = useMemo(() => {
    return Boolean(me?.role_ids?.includes("2"));
  }, [me]);

  const changeDashboardId = (id: string, skip_load: boolean = false) => {
    setSelectedDashboardId(id);
    updateSearchParams({ dashboard_id: id });
    if (skip_load) {
      return;
    } else {
      dashboard?.loadDashboard(
        id +
          "?" +
          Object.entries(global_filters)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        me,
        isLoading,
        dashboard,
        setDashboard,
        global_filters,
        setGlobalFilters,
        folder_id,
        board_id,
        selected_dashboard_id,
        changeDashboardId,
        is_admin,
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
