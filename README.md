# Dashboard Tabs - Looker Extension

A Looker extension that creates tabbed dashboards with advanced navigation, global filters, printing, theming, and adhoc dashboard management. It transforms Looker into a tabbed interface, enabling seamless switching between dashboards while preserving filters and context. Supports folder, board, and adhoc dashboard navigation, plus printing functionality.

![Dashboard Tabs](assets/extension.png)

## Use it now

Add this to any of your projects' `manifest.lkml` files, refresh the page, then go to Applications > Dashboard Tabs.

```
application: dashboard_tabs {
  label: "Dashboard Tabs"
  url: "https://cdn.lkr.dev/apps/dashboard-tabs/latest/bundle.js"
  entitlements: {
    core_api_methods: [
      "me", 
      "dashboard", 
      "search_dashboards", 
      "folder_dashboards", 
      "board", 
      "search_boards", 
      "folder", 
      "search_folders",
      "create_board",
      "create_board_section",
      "create_board_item"
    ]
    navigation: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    use_form_submit: yes
  }
}
```

## Features

### 🎯 Core Functionality

- **Tabbed Dashboard Interface**: Switch between multiple dashboards in a single interface
- **Global Filters**: Apply filters that persist across all dashboards
- **Print All Dashboards**: Generate PDF exports of all configured dashboards
- **Default and Custom Dashboard Tabs**: Configure a list of dashboard IDs to display as tabs, or use folders or boards as the tabs

### 🎨 Theming & Customization

- **Custom Background Colors**: Set custom background colors for the extension interface
- **Custom Paper Colors**: Configure paper/tile colors for dashboard elements
- **Automatic Text Contrast**: Automatically adjusts text colors for optimal readability
- **Theme Consistency**: Applied across the entire extension interface and embedded dashboards
- **Remove Branded Loading**: Option to hide the branded loading screen

### 🗂️ Navigation Options

#### Default Dashboard Tabs

- Configure a list of dashboard IDs to display as tabs
- Customizable extension label
- Automatic dashboard loading and switching

#### Folder Navigation

- Browse and navigate through Looker folders
- Access personal and shared folders
- Search functionality for finding specific folders
- Hierarchical folder tree display

#### Board Navigation

- Navigate through Looker boards
- Access favorite boards
- Search and browse all available boards
- Display board sections and dashboard items

#### Adhoc Dashboard Management

- **Dynamic Dashboard Selection**: Add and remove dashboards on-the-fly without configuration changes
- **Search and Add**: Search for dashboards and add them to the current session
- **Remove Dashboards**: Easily remove dashboards from the current adhoc session
- **Save as Board**: Convert adhoc dashboard collections into permanent Looker boards
- **Switch Between Modes**: Seamlessly switch between configured dashboards and adhoc mode

### 🖨️ Printing Capabilities

- **Print All Dashboards**: Generate PDF exports of all configured dashboards
- **Filter Preservation**: Maintains current filters when printing

## ⚙️ Settings & Configuration

The extension provides comprehensive settings management through the Settings dialog:

### Basic Configuration

- **Default Extension Label**: Customize the header text
- **Dashboard IDs**: Configure which dashboards appear as tabs
- **Dashboard Search**: Search and add dashboards to the configuration

### Theming Settings

- **Background Color**: Set the main background color for the extension interface
- **Paper Color**: Configure the color for dashboard tiles and paper elements
- **Remove Branded Loading**: Toggle the branded loading screen on/off

### Feature Toggles

- **Print All Dashboards**: Enable/turn off the print functionality
- **Enable Folder Navigation**: Show/hide folder navigation button
- **Enable Board Navigation**: Show/hide board navigation button
- **Allow Adhoc Dashboards**: Enable dynamic dashboard selection and management
- **Save Board from Adhoc Dashboards**: Allow converting adhoc collections to permanent boards

### Security & Permissions

- **Restrict Settings**: Limit who can modify extension settings
- **Group IDs**: Specify which user groups can update settings
- **Admin Override**: Administrators always have access to settings

## Versions and pinning a release

See [releases](https://github.com/lkrdev/dashboard-tabs/releases) for the latest versions. The CDN is updated automatically when a new version is released and you can pin your extension to a specific version with `url: "https://cdn.lkr.dev/apps/dashboard-tabs/<release>/bundle.js"`.

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm package manager
- Looker instance with extension framework enabled

### Build Process

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Development Mode**:
   ```bash

   # HTTPS development server (recommended for Looker)
   npm run dev:https

   # HTTP development server (recommended for development with a tunnel like cloudflared)
   npm run dev
   ```
3. **Production Build**:
   ```bash
   npm run build
   ```

### Manifest Configuration

The extension is configured through an application in your project's `manifest.lkml`:

```lookml
application: dashboard_tabs {
  label: "Dashboard Tabs"
  url: "https://localhost:8080/bundle.js"
  entitlements: {
    core_api_methods: [
      "me", 
      "dashboard", 
      "search_dashboards", 
      "folder_dashboards", 
      "board", 
      "search_boards", 
      "folder", 
      "search_folders",
      "create_board",
      "create_board_section",
      "create_board_item"
    ]
    navigation: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    use_form_submit: yes
  }
  mount_points: {
    standalone: yes
  }
}
```

If developing locally, you can use `url: "https://localhost:8080/bundle.js"`. If you are modifying the extension and don't have access to a CDN, you can run `npm run build` to generate a bundle.js file in the `dist` directory. Drag this file to your Looker project while in dev mode and then use `file: "bundle.js"` in the manifest instead of `url`.

### Required API Permissions

The extension requires the following Looker API methods:

- **User Management**: `me` - Get current user information
- **Dashboard Operations**: `dashboard`, `search_dashboards` - Access dashboard data
- **Folder Operations**: `folder`, `search_folders`, `folder_dashboards` - Navigate folders
- **Board Operations**: `board`, `search_boards` - Access board data
- **Board Creation**: `create_board`, `create_board_section`, `create_board_item` - Create boards from adhoc collections

## Usage

### Basic Usage

1. **Access the Extension**: Navigate to the extension in Looker's navigation sidebar under Applications.
2. **Configure Dashboards**: Use Settings to add dashboard IDs as the default dashboards if a board or folder is not selected.
3. **Navigate**: If you turn on folder or board navigation, use the sidebar buttons to switch between tab layouts.
4. **Apply Filters**: Global filters will persist across dashboard switches. Make sure the dashboard has the same filter names to apply them across dashboards.
5. **Print**: If you turn on print functionality, you can print all dashboards at once but turning on the print functionality.

### Theming

1. **Access Settings**: Click the Settings button in the sidebar (if you have permissions).
2. **Configure Colors**: Use the color pickers to set background and paper colors.
3. **Preview Changes**: Changes are applied immediately to see the effect.
4. **Save Settings**: Click "Save" to persist your theme configuration.

### Adhoc Dashboard Management

1. **Enable Adhoc Mode**: Ensure "Allow Adhoc Dashboards" is enabled in Settings.
2. **Switch to Adhoc**: Click "Switch to Adhoc Dashboards" to enter adhoc mode.
3. **Add Dashboards**: Click "Add Dashboard" to search and add dashboards to your session.
4. **Remove Dashboards**: Hover over dashboard items and click the remove button (X) to remove them.
5. **Save as Board**: If "Save Board from Adhoc Dashboards" is enabled, click "Save as Board" to create a permanent board from your current collection.

