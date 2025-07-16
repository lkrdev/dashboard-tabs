# Dashboard Tabs - Looker Extension

Transform your Looker experience with a powerful tabbed dashboard interface. This extension enables seamless switching between multiple dashboards while preserving filters, context, and navigation state. Perfect for users who need to work across multiple dashboards simultaneously. Supports folder, board, and adhoc dashboard navigation, plus printing functionality, but is configurable to turn off any of these features. It also supports *global filters*. As long as your dashboard filters share the same name, they will be applied to all dashboards in the tabbed interface.

![Dashboard Tabs](assets/extension.png)

## 🚀 Quick Start

Have a LookML Developer or Admin add this configuration to any of your projects' `manifest.lkml` files, refresh the page, then navigate to **Applications > Dashboard Tabs**.

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
      "create_board_item",
      "create_content_favorite"
    ]
    navigation: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    use_form_submit: yes
  }
}
```

Now go to settings and open a board, a folder, switch to adhoc dashboards or add default dashboards. For global filters to work, make sure the filters on each dashboard have the same name. For example if they have a "Date" filter, then navigating between the dashboards will pass the "Date" filter value to each dashboard.

You can use this extension multiple times with different configuration options by adding multiple applications to your manifest.lkml file. The URL can also be bookmarked by your users, shared, or put on a homepage or board item.

## Key Features

### Core Dashboard Management
- Switch between multiple dashboards in a single, unified interface
- Apply filters that persist across all dashboard switches
- Save your URL to come back to the same state with the same filters
- Use predefined dashboard lists, folders, or boards as your tab sources, or hide them away!

### Navigation Modes

#### Default Dashboard Tabs
- Configure specific dashboard IDs to display as tabs
- Customizable extension label

#### Folder Navigation
- Browse and navigate through Looker folders
- Access both personal and shared folders in a unified tabbed view

#### Board Navigation
- Navigate through Looker boards and their sections
- Only displays dashboards (no looks or links)
- Respects board sorting of sections and dashboards

#### Adhoc Dashboard Management
- Add and remove dashboards on-the-fly without configuration changes
- Search for dashboards and add them to your current session
- Convert adhoc dashboard collections into permanent Looker boards
- Seamlessly switch to adhoc from boards, folders or default dashboards

### Theming & Customization
- Set personalized background colors for the extension interface
- Smart text color adjustment for optimal readability
- Applied across the entire extension interface and embedded dashboards
- Option to hide the branded loading screen

### Advanced Printing
- Generate PDF exports of all configured dashboards in one operation
- Maintains current filters when printing
- Print multiple dashboards simultaneously

## Configuration & Settings

The extension provides comprehensive settings management through an intuitive Settings dialog:

### Basic Configuration
- Customize the header text and branding when in default dashboard mode
- Dashboard IDs: Configure which dashboards appear as default tabs
- Limit who can modify extension settings to admin or specific groups
- Turn on/off different modes for a presentation style extension

### Theming Options
- Set the main background color for the extension interface
- Configure colors for dashboard tiles and paper elements
- Toggle the branded loading screen on/off

## Required API Permissions

The extension requires these Looker API methods:

| Category | Methods | Purpose |
|----------|---------|---------|
| **User Management** | `me` | Get current user information |
| **Dashboard Operations** | `dashboard`, `search_dashboards` | Access dashboard data |
| **Folder Operations** | `folder`, `search_folders`, `folder_dashboards` | Navigate folders |
| **Board Operations** | `board`, `search_boards` | Access board data |
| **Board Creation** | `create_board`, `create_board_section`, `create_board_item`, `create_content_favorite` | Create boards from adhoc collections |


## Development

### Prerequisites
- Node.js (20 or higher, see [.nvmrc](.nvmrc) for the exact version)
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
      "create_board_item",
      "create_content_favorite"
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

## Version Management

See [releases](https://github.com/lkrdev/dashboard-tabs/releases) for the latest versions. The CDN updates automatically with new releases. To pin to a specific version, use:

```lookml
url: "https://cdn.lkr.dev/apps/dashboard-tabs/<release>/bundle.js"
```

