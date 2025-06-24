# Simple Looker Extension

This is a simple, no-frills, modern example of a [Looker extension](https://cloud.google.com/looker/docs/intro-to-extension-framework) built with React and TypeScript that you can use to quickly get up and running with custom functionality in your Looker instance.

## Installation
- Clone repo to your local computer
- `cd simple-looker-extensions`
- `yarn install`
- `yarn run dev`

Your extension should now be running at https://localhost:8080/bundle.js.  It is being served over HTTPS by Webpack, but it is not using a verified HTTPS certificate.  In order to bypass the warning you would likely see if you navigated to the aforementioned URL, seen below, click "Advanced", then "Proceed Anyway".

![image](https://github.com/user-attachments/assets/12e1390b-31c4-4036-a909-25dc1e3bc64c)

Looker will now be able to access your extension during development.

### Looker

In a LookML project manifest file, add the following to enable the extension:

```
application: simple_extension {
  label: "Simple Extension"
  url: "https://localhost:8080/bundle.js"
  # file: "bundle.js"
  entitlements: {
    core_api_methods: ["me", "run_inline_query"]
    navigation: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    new_window_external_urls: []
    local_storage: yes
    external_api_urls: []
  }
  mount_points: {
    dashboard_vis: no
    dashboard_tile: yes
    standalone: yes
  }
}
```

You can find the extension under Applications > Simple Extension in the Looker UI left-hand sidebar.

## Production

To productionalize your code, run `npm run build`, then copy the generated **bundle.js** file in the dist/ folder into the LookML project where you've defined the extension.  Comment out the _url_ property and uncomment _file_:

```
application: simple_extension {
  label: "Simple Extension"
  # url: "https://localhost:8080/bundle.js"
  file: "bundle.js"
  entitlements: {
    core_api_methods: ["me", "run_inline_query"]
    navigation: yes
    use_embeds: yes
    use_iframes: yes
    new_window: yes
    new_window_external_urls: []
    local_storage: yes
    external_api_urls: []
  }
  mount_points: {
    dashboard_vis: no
    dashboard_tile: yes
    standalone: yes
  }
}
```

Commit this change and push to production.
