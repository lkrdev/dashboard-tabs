import { ComponentsProvider } from "@looker/components";
import "@looker/embed-sdk";
import { ExtensionProvider } from "@looker/extension-sdk-react";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppContextProvider } from "./AppContext";
import useConfigContext, { ConfigContextProvider } from "./ConfigContext";
import { ToastProvider } from "./components/Toast/ToastContext";
import "./index.css";
import { getTextColor } from "./utils/colorUtils";
import { DEFAULT_DASHBOARD_PAPER_COLOR } from "./utils/constants";

declare module "@looker/embed-sdk" {
  interface ILookerConnection {
    _currentPathname?: string;
  }
}

const mountApp = () => {
  const rootId = "extension-root";
  let root = document.getElementById(rootId);

  if (!root) {
    root = document.createElement("div") as HTMLDivElement;
    root.id = rootId;
    root.style = "height: 100%; display: flex; margin: 0;";
    document.body.appendChild(root);
  }

  ReactDOM.render(
    <ExtensionProvider>
      <AppContextProvider>
        <ConfigContextProvider>
          <ComponentsWrapper>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ComponentsWrapper>
        </ConfigContextProvider>
      </AppContextProvider>
    </ExtensionProvider>,
    root
  );
};

const ComponentsWrapper = ({ children }: { children: React.ReactNode }) => {
  const {
    config: { background_color, paper_color },
  } = useConfigContext();

  return (
    <ComponentsProvider
      themeCustomizations={{
        colors: {
          key: background_color,
          background: paper_color || DEFAULT_DASHBOARD_PAPER_COLOR,
          text: getTextColor(paper_color || DEFAULT_DASHBOARD_PAPER_COLOR),
          title: getTextColor(paper_color || DEFAULT_DASHBOARD_PAPER_COLOR),
          body: getTextColor(paper_color || DEFAULT_DASHBOARD_PAPER_COLOR),
        },
      }}
    >
      {children}
    </ComponentsProvider>
  );
};

window.addEventListener("DOMContentLoaded", mountApp);
