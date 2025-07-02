import { ButtonOutline } from "@looker/components";
import React from "react";
import { useHistory } from "react-router-dom";
import useSearchParams from "../hooks/useSearchParams";

const SwitchToAdhocDashboard: React.FC<{ current_dashboard_ids: string[] }> = ({
  current_dashboard_ids,
}) => {
  const history = useHistory();
  const { search_params, updateSearchParams } = useSearchParams();

  const handleSwitch = () => {
    const path = `/dashboards${
      current_dashboard_ids.length ? `/${current_dashboard_ids.join("/")}` : ""
    }`;
    const search = Object.entries(search_params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    history.push(`${path}?${search}`);
  };
  return (
    <ButtonOutline fullWidth onClick={handleSwitch}>
      Switch to Adhoc Dashboards
    </ButtonOutline>
  );
};

export default SwitchToAdhocDashboard;
