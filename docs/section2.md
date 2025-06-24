# Looker Components and Configuration

To get started on this section, run `git checkout section2-start --force`, to jump to the end of this section, run `git checkout section2-end --force`

## Overview

- Learn about Extension API configurations
- Loading and saving configuration options
- Creating tabs and loading on tab change


## Items to Teach
- @looker/extension-sdk-react
  - the extension api and use Extension
  - Configuring an Extension
- @looker/components
  - List and ListItem, InputChips
- @looker/embed-sdk 2.0
  - loadDashboard
- React API `key`


# Learn about Extension API configurations

The Looker Extension API provides a set of methods for storing and retrieving configuration or state data that persists across user sessions. The most relevant methods for this are:

- **getContextData**: Retrieves the current context data for the extension. This is typically used to load saved settings or configuration when the extension initializes.
- **saveContextData**: Persists new or updated context data. This allows you to save user preferences or other stateful information.
- **refreshContextData**: Forces the extension to reload the context data, ensuring the UI reflects the latest saved state.


1. Open the Settings.tsx file
2. Add the following code to the component to be used for getting and saving the dashboard ids


```tsx
const Settings: React.FC = () => {
  const open = useBoolean(false);
  const extension_sdk = useExtensionSdk();
  const config_data = extension_sdk.getContextData();
  const [dashboard_ids, setDashboardIds] = useState<string[]>(
    config_data?.[DASHBOARD_ID_KEY] || []
  );

  const handleChange = async (values: string[]) => {
    setDashboardIds(values);
    await extension_sdk.saveContextData({
      [DASHBOARD_ID_KEY]: values,
    });
    await extension_sdk.refreshContextData();
  };
  // rest of the code
```
3. Make sure you import the constants file `import { DASHBOARD_ID_KEY } from "./utils/constants";` as well as the useExtensionSdk hook `import useExtensionSdk from "./hooks/useExtensionSdk";` and the useState hook `import { useState } from "react";`
4. Now lets add an InputChips component that displays and saves any dashboard_id we put in the component.

```tsx
<DialogContent minHeight={"400px"}>
    <Space>
    <Label>Dashboard IDs for the tabs</Label>
    <InputChips
        placeholder="Dashboard IDs"
        values={dashboard_ids}
        onChange={handleChange}
    />
    </Space>
</DialogContent>
```

4. Make sure to import Space, label, and InputChips from @looker/components. `import { Space, Label, InputChips } from "@looker/components";`
5. Refresh your page and click the Settings button
6. Enter in `thelook_ecomm:business_pulse` and `thelook_ecomm:brand_lookup`.
7. Refresh the page and open the settings again, you should see these two values saved.

### Extension Context Data Example

1. **Loading Existing Data**  
   When the component mounts, it calls `getContextData()` to retrieve any previously saved dashboard IDs. These are then set as the initial value for the `InputChips` component.

   ```typescript
   const config_data = extension_sdk.getContextData();
   const [dashboard_ids, setDashboardIds] = useState<string[]>(
     config_data?.[DASHBOARD_ID_KEY] || []
   );
   ```

2. **Updating Data**  
   When the user adds or removes dashboard IDs using the `InputChips` UI, the `handleChange` function is triggered. This function:
   - Updates the local state with the new list of IDs.
   - Calls `saveContextData()` to persist the updated list.
   - Calls `refreshContextData()` to ensure the UI is in sync with the latest saved data.

   ```typescript
   const handleChange = (values: string[]) => {
     setDashboardIds(values);
     extension_sdk.saveContextData({
       [DASHBOARD_ID_KEY]: values,
     });
     extension_sdk.refreshContextData();
   };
   ```

3. **User Experience**  
   The `InputChips` component provides a user-friendly way to manage a dynamic list of values. By integrating it with the Extension API's context data methods, any changes the user makes are automatically saved and reloaded as needed.

### Why Use Context Data?

Using context data methods allows your extension to remember user preferences or configuration settings, providing a seamless and personalized experience each time the extension is loaded.

For more details on the Looker Extension API and best practices, see the [official Looker documentation](https://cloud.google.com/looker/docs/extension-framework-react-and-js-code-examples).


# Creating tabs and loading on tab change

1. Open up the [Sidebar.tsx](../src/Sidebar.tsx) file.
2. Load in the extension context to this component with the following code

```tsx
const Sidebar: React.FC = () => {
  const extension_sdk = useExtensionSdk();
  const config_data = extension_sdk.getContextData();
  const dashboard_ids = config_data?.[DASHBOARD_ID_KEY] || [];
  // rest of the component

```

3. Make sure you import the constants file `import { DASHBOARD_ID_KEY } from "./utils/constants";` as well as the useExtensionSdk hook `import useExtensionSdk from "./hooks/useExtensionSdk";`
4. Replace the placeholder components `<Span><Balancer>Configureable dashboard selections...</Balancer></Span>` with the following code. This will display a button for each dashboard_id in the sidebar.

```tsx
<List>
    {dashboard_ids.map((dashboard_id) => (
        <ListItem key={dashboard_id} onClick={() => {}}>
            {dashboard_id}
        </ListItem>
    ))}
</List>
```

5. Now we need to set the next dashboard to load when the user clicks on a button. We'll start by using our dashboard object from the AppContext. This import `import { useAppContext } from "./AppContext";` should already be loaded.

```tsx
const Sidebar: React.FC = () => {
    const { global_filters, dashboard } = useAppContext();
    // rest of the component
```

6. Now we need to add a function to load the next dashboard. Add the following onClick to the ListItem component.

```tsx
onClick={() => {
    dashboard?.loadDashboard(
    dashboard_id +
        "?" +
        Object.entries(global_filters)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")
    );
}}
```

7. Make the ListItem show selected state when the dashboard is loaded.

```tsx
<ListItem
    selected={dashboard?._currentPathname?.startsWith(
        `/embed/dashboards/${dashboard_id}`
    )}
    key={dashboard_id}
    // rest of component
```

8. Navigate over to the [Dashboard.tsx](../src/Dashboard.tsx) file.
9. Change your hard coded dashboard_id in `createDashboardWithId` to `.createDashboardWithId(extension_sdk.getContextData()?.dashboards?.[0]!)` so that the initial load navigates to the first dashboard in the sidebar.

# What are Looker Components?

Looker components are reusable building blocks provided by Looker (now part of Google Cloud) that help developers and analysts create, customize, and extend data experiences within the Looker platform. These components can refer to several things depending on the context:

## 1. Looker UI Components

Looker offers a set of UI components (sometimes called Looker Components or Looker UI Components) that developers can use to build custom data applications, embed analytics, or extend Looker's functionality. These components are typically available through the [Looker Components library](https://github.com/looker-open-source/components), which is an open-source React component library. They provide:

- **Pre-built UI elements** for dashboards, filters, buttons, inputs, and more
- **Consistent design** with Looker's native interface
- **Easy integration** with Looker APIs and data

These components are especially useful for building Looker Extensions or custom embedded analytics solutions.

## 2. Looker Dashboard Components

Within the Looker platform, a dashboard is made up of various components, such as:

- **Tiles**: Visualizations, tables, or text/Markdown blocks
- **Filters**: Controls that let users interactively filter dashboard data
- **Buttons**: For actions like running queries or triggering data deliveries

Each of these is a component that can be configured and arranged to create interactive, informative dashboards.

## Looker Visualization Components

Looker Visualization Components are the elements that display data visually within Looker dashboards and Explores. These components help users interpret and analyze data by presenting it in graphical formats, making trends and insights easier to spot.

### Types of Visualization Components

Looker provides a variety of built-in visualization types, including:

- **Bar charts**
- **Column charts**
- **Line charts**
- **Area charts**
- **Pie and donut charts**
- **Scatterplots**
- **Boxplots**
- **Waterfall charts**
- **Funnel charts**
- **Single value and single record charts**
- **Tables (legacy and modern)**
- **Maps and geographic visualizations**
- **Word clouds**

Each visualization component can be customized with options for colors, labels, axes, legends, and more, allowing users to tailor the display to their needs.

Visualization components are essential for transforming raw data into actionable insights, making Looker a powerful tool for business intelligence and analytics.

## Summary

In summary, "Looker components" can refer to:
- UI elements for building custom apps or extensions
- Dashboard elements like tiles and filters
- LookML model building blocks

For more details on using Looker's Markdown tiles and supported syntax, see the [official documentation](https://cloud.google.com/looker/docs/using-markdown-in-text-tiles).

### What is `key` in <ListItem key={dashboard_id} >?

In React, the `key` prop is a special attribute you must include when creating lists of elements. It helps React identify which items have changed, been added, or been removed, making the process of updating the UI more efficient and predictable.

When you render a list using `.map()`, like this:

```tsx
<List>
  {dashboard_ids.map((dashboard_id) => (
    <ListItem key={dashboard_id}>
      {dashboard_id}
    </ListItem>
  ))}
</List>
```

The `key={dashboard_id}` part assigns a unique identifier to each `ListItem` component. This is important because React uses these keys to keep track of each element between renders. If the list changes (for example, if items are added, removed, or reordered), React can use the keys to determine exactly what changed and update only the necessary elements, rather than re-rendering the entire list.

**Why is this important?**
- Without a unique `key`, React will warn you and may not update the UI as you expect. It might reuse or reorder elements incorrectly, leading to bugs or unexpected behavior.
- The `key` should be unique among siblings. Using something stable and unique like an ID (here, `dashboard_id`) is best. Avoid using the array index as a key unless you have no other unique identifier, as this can cause issues when the list order changes.

**Example:**
```tsx
const items = [
  { id: 'apple', value: '🍎 apple' },
  { id: 'orange', value: '🍊 orange' },
];

<ul>
  {items.map(item => (
    <li key={item.id}>{item.value}</li>
  ))}
</ul>
```

**References:**
- [React Docs: Lists and Keys](https://legacy.reactjs.org/docs/lists-and-keys.html)
- [Why React needs a key prop (Kent C. Dodds)](https://www.epicreact.dev/why-react-needs-a-key-prop)