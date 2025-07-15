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
  mount_points: {
    standalone: yes
  }
}