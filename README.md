# Dashboard Tabs - Looker Extension

Transform your Looker experience with a powerful tabbed dashboard interface. This extension enables seamless switching between multiple dashboards while preserving filters, context, and navigation state. Perfect for users who need to work across multiple dashboards simultaneously. Supports folder, board, and adhoc dashboard navigation, plus printing functionality, but is configurable to turn off any of these features. It also supports *global filters*. As long as your dashboard filters share the same name, they will be applied to all dashboards in the tabbed interface.

![Dashboard Tabs](assets/extension.png)

## 🚀 Quick Start

Add this configuration to any of your projects' `manifest.lkml` files, refresh the page, then navigate to **Applications > Dashboard Tabs**.

```lookml
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

## ✨ Key Features

### 🎯 Core Dashboard Management
- **Tabbed Interface**: Switch between multiple dashboards in a single, unified interface
- **Global Filters**: Apply filters that persist across all dashboard switches
- **Context Preservation**: Maintain navigation state and filters when switching tabs
- **Flexible Configuration**: Use predefined dashboard lists, folders, or boards as your tab sources

### 🗂️ Multiple Navigation Modes

#### **Default Dashboard Tabs**
- Configure specific dashboard IDs to display as tabs
- Customizable extension label and branding
- Automatic dashboard loading and switching

#### **Folder Navigation**
- Browse and navigate through Looker folders
- Access both personal and shared folders
- Search functionality for finding specific folders
- Hierarchical folder tree display

#### **Board Navigation**
- Navigate through Looker boards and favorites
- Search and browse all available boards
- Display board sections and dashboard items

#### **Adhoc Dashboard Management**
- **Dynamic Selection**: Add and remove dashboards on-the-fly without configuration changes
- **Search & Add**: Search for dashboards and add them to your current session
- **Session Management**: Easily remove dashboards from your current adhoc session
- **Save as Board**: Convert adhoc dashboard collections into permanent Looker boards
- **Mode Switching**: Seamlessly switch between configured dashboards and adhoc mode

### 🎨 Theming & Customization
- **Custom Background Colors**: Set personalized background colors for the extension interface
- **Custom Paper Colors**: Configure colors for dashboard tiles and paper elements
- **Automatic Text Contrast**: Smart text color adjustment for optimal readability
- **Theme Consistency**: Applied across the entire extension interface and embedded dashboards
- **Branded Loading Control**: Option to hide the branded loading screen

### 🖨️ Advanced Printing
- **Print All Dashboards**: Generate PDF exports of all configured dashboards in one operation
- **Filter Preservation**: Maintains current filters when printing
- **Batch Processing**: Print multiple dashboards simultaneously

## ⚙️ Configuration & Settings

The extension provides comprehensive settings management through an intuitive Settings dialog:

### **Basic Configuration**
- **Extension Label**: Customize the header text and branding
- **Dashboard IDs**: Configure which dashboards appear as default tabs
- **Dashboard Search**: Search and add dashboards to your configuration

### **Theming Options**
- **Background Color**: Set the main background color for the extension interface
- **Paper Color**: Configure colors for dashboard tiles and paper elements
- **Loading Screen**: Toggle the branded loading screen on/off

### **Feature Controls**
- **Print Functionality**: Enable/disable the print all dashboards feature
- **Folder Navigation**: Show/hide the folder navigation button
- **Board Navigation**: Show/hide the board navigation button
- **Adhoc Dashboards**: Enable dynamic dashboard selection and management
- **Board Creation**: Allow converting adhoc collections to permanent boards

### **Security & Permissions**
- **Settings Access Control**: Limit who can modify extension settings
- **Group-based Permissions**: Specify which user groups can update settings
- **Admin Override**: Administrators always maintain access to settings

## 📋 Usage Guide

### **Getting Started**
1. **Access the Extension**: Navigate to the extension in Looker's navigation sidebar under **Applications**
2. **Configure Dashboards**: Use Settings to add dashboard IDs as default dashboards (if not using board or folder navigation)
3. **Navigate Between Modes**: Use the sidebar buttons to switch between different tab layouts (folder, board, or adhoc)
4. **Apply Global Filters**: Filters persist across dashboard switches - ensure dashboards have matching filter names
5. **Print Dashboards**: Enable print functionality to generate PDF exports of all dashboards

### **Customizing Your Theme**
1. **Access Settings**: Click the Settings button in the sidebar (requires appropriate permissions)
2. **Configure Colors**: Use the color pickers to set background and paper colors
3. **Preview Changes**: Changes are applied immediately for real-time preview
4. **Save Configuration**: Click "Save" to persist your theme settings

### **Managing Adhoc Dashboards**
1. **Enable Adhoc Mode**: Ensure "Allow Adhoc Dashboards" is enabled in Settings
2. **Switch to Adhoc**: Click "Switch to Adhoc Dashboards" to enter dynamic mode
3. **Add Dashboards**: Click "Add Dashboard" to search and add dashboards to your session
4. **Remove Dashboards**: Hover over dashboard items and click the remove button (X) to remove them
5. **Save as Board**: If enabled, click "Save as Board" to create a permanent board from your current collection

## 🔧 Development

### **Prerequisites**
- Node.js (v18 or higher)
- npm package manager
- Looker instance with extension framework enabled

### **Build Commands**

```bash
# Install dependencies
npm install

# Development servers
npm run dev:https    # HTTPS (recommended for Looker)
npm run dev          # HTTP (for development with tunnels like cloudflared)

# Production build
npm run build
```

### **Local Development Configuration**

For local development, use this manifest configuration:

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

**Note**: For local development without CDN access, run `npm run build` to generate a `bundle.js` file in the `dist` directory. Drag this file to your Looker project in dev mode and use `file: "bundle.js"` in the manifest instead of `url`.

### **Required API Permissions**

The extension requires these Looker API methods:

| Category | Methods | Purpose |
|----------|---------|---------|
| **User Management** | `me` | Get current user information |
| **Dashboard Operations** | `dashboard`, `search_dashboards` | Access dashboard data |
| **Folder Operations** | `folder`, `search_folders`, `folder_dashboards` | Navigate folders |
| **Board Operations** | `board`, `search_boards` | Access board data |
| **Board Creation** | `create_board`, `create_board_section`, `create_board_item`, `create_content_favorite` | Create boards from adhoc collections |

## 📦 Version Management

See [releases](https://github.com/lkrdev/dashboard-tabs/releases) for the latest versions. The CDN updates automatically with new releases. To pin to a specific version, use:

```lookml
url: "https://cdn.lkr.dev/apps/dashboard-tabs/<release>/bundle.js"
```

