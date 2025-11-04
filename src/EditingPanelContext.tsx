
import React, { createContext, useState, useContext, useCallback } from 'react';
import { LookerDashboardOptions as DashboardLayout } from "@looker/embed-sdk";

interface EditingPanelContextType {
  isEditing: boolean;
  editingLayout: DashboardLayout | undefined;
  openEditingPanel: (layout: DashboardLayout) => void;
  closeEditingPanel: () => void;
  updateEditingLayout: (layout: DashboardLayout) => void;
  getLayoutFromArtifact: () => Promise<DashboardLayout | undefined>;
  saveLayoutToArtifact: (layout: DashboardLayout) => Promise<void>;
}

const EditingPanelContext = createContext<EditingPanelContextType | undefined>(
  undefined
);

interface EditingPanelProviderProps {
  children: React.ReactNode;
  extensionContext: any;
  selected_dashboard_id: string | undefined;
  user_id: string | undefined;
}

export const EditingPanelProvider: React.FC<EditingPanelProviderProps> = ({ children, extensionContext, selected_dashboard_id, user_id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLayout, setEditingLayout] = useState<DashboardLayout | undefined>(
    undefined
  );

  const openEditingPanel = useCallback((layout: DashboardLayout) => {
    setEditingLayout(JSON.parse(JSON.stringify(layout)));
    setIsEditing(true);
  }, []);

  const closeEditingPanel = useCallback(() => {
    setIsEditing(false);
    setEditingLayout(undefined);
  }, []);

  const updateEditingLayout = useCallback((updater: (prevLayout: DashboardLayout | undefined) => DashboardLayout) => {
    setEditingLayout(updater);
  }, []);

  const getLayoutFromArtifact = useCallback(async (): Promise<any | undefined> => { 
    if (extensionContext && selected_dashboard_id) {
      try {
        // pull artifacts in user's namespace
        const artifact = await extensionContext.ok(extensionContext.artifact({namespace: user_id, key: selected_dashboard_id}));
        console.log("artifact: ",artifact)
        return {body: JSON.parse(artifact[0].value), version: artifact[0].version};
      } catch (error) {
        console.error('Error getting artifact', error);
        return undefined;
      }
    }
    return undefined;
  },[extensionContext, selected_dashboard_id, user_id]);

  const saveLayoutToArtifact = useCallback(async (layout: DashboardLayout) => {
    const exists = await getLayoutFromArtifact()
    if (extensionContext && selected_dashboard_id) {
      try {
        const body = [
          {
            key: selected_dashboard_id,
            value: JSON.stringify(layout),
            ...(exists && { version: exists.version }),
            content_type: 'application/json'
          }
        ];

        console.log(body)
        // save artifact to user's namespace
        await extensionContext.ok(extensionContext.update_artifacts(user_id,body));
      } catch (error) {
        console.error('Error updating artifact', error);
      }
    }
  },[extensionContext, selected_dashboard_id, user_id]);

  return (
    <EditingPanelContext.Provider
      value={{
        isEditing,
        editingLayout,
        setEditingLayout,
        openEditingPanel,
        closeEditingPanel,
        updateEditingLayout,
        getLayoutFromArtifact,
        saveLayoutToArtifact,
      }}
    >
      {children}
    </EditingPanelContext.Provider>
  );
};

export const useEditingPanel = () => {
  const context = useContext(EditingPanelContext);
  if (!context) {
    throw new Error('useEditingPanel must be used within an EditingPanelProvider');
  }
  return context;
};

