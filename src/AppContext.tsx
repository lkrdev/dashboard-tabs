import { ILookerConnection } from "@looker/embed-sdk";
import { IUser } from "@looker/sdk";
import React, { createContext, useContext, useEffect } from "react";
import useSWR from "swr";
import useSdk from "./hooks/useSdk";
import useSearchParams from "./hooks/useSearchParams";
import { useLocation } from "react-router-dom";

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
  selected_dashboard_id?: string;
  setSelectedDashboardId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { search_params, updateSearchParams } = useSearchParams()
  const sdk = useSdk();
  const { data: me, isLoading, error } = useSWR("me", () => sdk.ok(sdk.me()));
  const [dashboard, setDashboard] = React.useState<ILookerConnection>();
  const [global_filters, setGlobalFilters] = React.useState<GlobalFilters>(search_params);
  const [selected_dashboard_id, setSelectedDashboardId] = React.useState<string | undefined>(search_params.dashboard_id);

  const location = useLocation()
  const folder_id = location.pathname.startsWith('/folders/') ? location.pathname.split('/')[2] : undefined

  useEffect(() => {
    updateSearchParams(global_filters)
  }, [global_filters])

  useEffect(()=>{
    updateSearchParams({ dashboard_id: selected_dashboard_id })
  }, [selected_dashboard_id])


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
        selected_dashboard_id,
        setSelectedDashboardId
      }}
    >
      {children}
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
