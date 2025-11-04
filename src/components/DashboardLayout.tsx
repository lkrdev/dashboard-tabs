import React, { useEffect, useRef } from 'react';
import useConfigContext from '../ConfigContext';
import { useAppContext } from '../AppContext';
import { useEditingPanel } from '../EditingPanelContext';
import { Button } from '@looker/components';

const DashboardLayout: React.FC = () => {
  const { dashboardLayout } = useAppContext();
  const { config } = useConfigContext();
  const originalDashboardLayout = useRef<any>();
  const { openEditingPanel } = useEditingPanel();

  useEffect(() => {
    if (dashboardLayout && !originalDashboardLayout.current) {
      originalDashboardLayout.current = JSON.parse(JSON.stringify(dashboardLayout));
    }
  }, [dashboardLayout]);

  if (dashboardLayout === undefined) {
    return <></>
  }

  if (!config.customize_dashboard_layout) {
    return <></>
  }

  return (
    <>
      <div
        className="editing-toolbar"
        style={{ backgroundColor: config.paper_color }}
      >
        <Button
          onClick={() => openEditingPanel(dashboardLayout)}
          color={'neutral'}
          iconBefore={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="100%" height="100%" fill={config.paper_color}><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>}
        >
        </Button>
      </div>
    </>
  );
};

export default DashboardLayout;
