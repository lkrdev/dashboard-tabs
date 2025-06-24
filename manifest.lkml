application: simple_extension {
  label: "Simple Extension"
#   url: "https://localhost:8080/bundle.js"
  file: "bundle.js"
  entitlements: {
    core_api_methods: ["me", "search_dashboards", "dashboard", "folder_dashboards"]
  }
}