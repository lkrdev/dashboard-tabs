
import React, { useCallback, useMemo } from 'react';
import { LookerDashboardOptions, DashboardLayoutComponent } from "@looker/embed-sdk";
import { useEditingPanel } from '../EditingPanelContext';
import { Button, Box, Space } from '@looker/components';
import { useAppContext } from '../AppContext';
import ReactGridLayout, { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface EditingPanelProps {
  dashboardLayout: LookerDashboardOptions;
  onUpdateLayout: (newLayout: LookerDashboardOptions) => void;
  onClose: () => void;
}

const EditingPanel: React.FC<EditingPanelProps> = ({
  dashboardLayout,
  onUpdateLayout,
  onClose,
}) => {
  const { saveLayoutToArtifact, editingLayout } = useEditingPanel();
  const { setDashboardLayout, dashboard } = useAppContext();

  const layoutComponents = useMemo(() => {
    // @ts-ignore - Assuming the structure matches the Looker SDK types
    return dashboardLayout?.layouts?.[0]?.dashboard_layout_components || [];
  }, [dashboardLayout]);

  // Calculating the "rglLayout" data safely (used here for list display, not interactive grid)
  const rglLayout = useMemo(() => {
    return layoutComponents.map((component) => ({
      i: component.dashboard_element_id,
      x: component.column,
      y: component.row,
      w: component.width,
      h: component.height,
    }));
  }, [layoutComponents]);

  const handleLayoutChange = useCallback((layout: ReactGridLayout.Layout[]) => {
    const prevLayout = dashboardLayout; // Use the prop as the 'prev' state
    const newLayout = JSON.parse(JSON.stringify(prevLayout));

    // Safely retrieve existing layout components from the currently displayed layout 
    const originalComponents = dashboardLayout?.layouts?.[0]?.dashboard_layout_components || [];

    if (!newLayout.layouts?.[0]) {
      console.error("Layout structure missing in the layout being updated.");
      return; // Exit early
    }

    newLayout.layouts[0].dashboard_layout_components = layout.map((item) => {
      const originalComponent = originalComponents.find(
        // @ts-ignore - 'i' is expected from the layout library structure
        (c) => c.dashboard_element_id === item.i
      );

      // Use optional chaining for safe access to properties on the found component
      return ({
        id: originalComponent?.id,
        dashboard_layout_id: originalComponent?.dashboard_layout_id,
        dashboard_element_id: item.i,
        column: item.x,
        row: item.y,
        width: item.w,
        height: item.h,
      });
    });

    onUpdateLayout(newLayout);
  }, [dashboardLayout, onUpdateLayout]);

  const handleClick = useCallback((element_id) => {
    const prevLayout = dashboardLayout;
    const newLayout = JSON.parse(JSON.stringify(prevLayout));

    // Safety check before modifying nested properties
    if (!newLayout.layouts?.[0] || !newLayout.elements) {
      console.error("Cannot delete element: layout structure is incomplete.");
      return;
    }

    newLayout.layouts[0].dashboard_layout_components = newLayout.layouts[0].dashboard_layout_components.filter(
      (c: DashboardLayoutComponent) => c.dashboard_element_id !== element_id
    );
    // @ts-ignore
    delete newLayout.elements[element_id];
    onUpdateLayout(newLayout);
  }, [onUpdateLayout, dashboardLayout]); // Added dashboardLayout to dependencies

  const handleSave = useCallback(async () => {
    if (!editingLayout) return;
    if (editingLayout.layouts === undefined || editingLayout.layouts.length === 0) return;

    setDashboardLayout(editingLayout);
    dashboard?.asDashboardConnection().setOptions(editingLayout)
    await saveLayoutToArtifact(editingLayout);
    onClose();

  }, [dashboardLayout, dashboard, editingLayout, setDashboardLayout, saveLayoutToArtifact, onClose])

  // Use the safely derived 'layoutComponents' array and dashboard elements to guard rendering.
  if (layoutComponents.length === 0 || dashboardLayout.elements === undefined) {
    return <></>
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          width: '90%',
          height: '90%',
          overflow: 'auto',
        }}
      >
        <Button onClick={onClose} iconAfter={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>} />
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: rglLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
          rowHeight={30}
          onLayoutChange={handleLayoutChange}
        >
          {rglLayout.map((item) => (
            <div
              key={item.i}
              onMouseEnter={() => {
                const button = document.getElementById(`tile-button-${item.i}`);
                if (button) button.style.opacity = '1';
              }}
              onMouseLeave={() => {
                const button = document.getElementById(`tile-button-${item.i}`);
                if (button) button.style.opacity = '0';
              }}
              style={{ border: '1px dashed black', borderRadius: '0.2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '0.4rem', fontSize: '1.2rem' }}
            >
              <div style={{ zIndex: 10000, position: 'relative', display: 'flex', flexDirection: 'row' }}>
                <span id={`tile-button-${item.i}`} onClick={() => handleClick(item.i)} style={{ paddingRight: '2rem', cursor: 'pointer', opacity: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
                </span>
                {dashboardLayout.elements && dashboardLayout?.elements[item.i]?.title}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
        <Space>
          <Button iconBefore={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>} onClick={handleSave} marginTop="medium">
            Save Layout
          </Button>
        </Space>
      </Box>
    </div>
  );
};

export default EditingPanel;
