import React, { useState, useEffect, useRef } from 'react';
import useConfigContext from '../../ConfigContext';
import { useAppContext } from '../../AppContext';

const VizSwapper: React.FC = () => {
  const [vizType, setVizType] = useState<string | undefined>('unset');
  const { dashboardLayout, dashboard } = useAppContext();
  const { config } = useConfigContext();
  const originalDashboardLayout = useRef<any>();
  const allowed_vizs = ["looker_line","looker_area","looker_column","looker_bar"]

  useEffect(() => {
    if (dashboardLayout && !originalDashboardLayout.current) {
      originalDashboardLayout.current = JSON.parse(JSON.stringify(dashboardLayout));
    }
  }, [dashboardLayout]);

  useEffect(() => {
    if (vizType !== undefined && dashboardLayout !== undefined) {
      console.log('Viz Type:', vizType);
      console.log('Dashboard Layout:', dashboardLayout);
      if (vizType === 'unset') {
        if (originalDashboardLayout.current) {
          dashboard?.asDashboardConnection().setOptions({
            ...originalDashboardLayout.current
          })
          // dashboardLayout.elements = originalDashboardLayout.current.elements
        }
        return;
      }

      const { elements, layouts } = dashboardLayout
      if(elements === undefined) return;

      Object.keys(elements).forEach((el) => {
        if(elements[el].vis_config !== undefined) {
          if(allowed_vizs.includes(elements[el].vis_config.type)) {
            elements[el].vis_config.type = vizType
          }
        }
      })

      dashboard?.asDashboardConnection().setOptions({
        elements: elements,
        layouts: layouts
      })
    }
  }, [vizType, dashboardLayout]);

  return (
    <div 
      className="viz-swapper-toolbar" 
      style={{ backgroundColor: config.background_color }}
    >
      <button 
        onClick={() => setVizType('looker_line')}
        className={vizType === 'looker_line' ? 'active' : ''}
        style={{ backgroundColor: config.paper_color }}
      ><img width="24" height="24" src="https://img.icons8.com/material-rounded/24/graph.png" alt="graph"/></button>
      <button 
        onClick={() => setVizType('looker_bar')}
        className={vizType === 'looker_bar' ? 'active' : ''}
        style={{ backgroundColor: config.paper_color }}
      ><img width="24" height="24" src="https://img.icons8.com/material-outlined/24/bar-chart.png" alt="bar-chart"/></button>
      <button 
        onClick={() => setVizType('looker_area')}
        className={vizType === 'looker_area' ? 'active' : ''}
        style={{ backgroundColor: config.paper_color }}
      ><img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/area-chart.png" alt="area-chart"/></button>
      {/* <button 
        onClick={() => setVizType('unset')}
        className={vizType === 'unset' ? 'active' : ''}
        style={{ backgroundColor: config.paper_color }}
      >X</button> */}
    </div>
  );
};

export default VizSwapper;
