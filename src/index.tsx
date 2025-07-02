import { ComponentsProvider } from "@looker/components";
import "@looker/embed-sdk";
import { ExtensionProvider } from "@looker/extension-sdk-react";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppContextProvider } from "./AppContext";
import { ConfigContextProvider } from "./ConfigContext";
import { ToastProvider } from "./components/Toast/ToastContext";
import "./index.css";

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
      <ComponentsProvider>
        <AppContextProvider>
          <ConfigContextProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ConfigContextProvider>
        </AppContextProvider>
      </ComponentsProvider>
    </ExtensionProvider>,
    root
  );
};

window.addEventListener("DOMContentLoaded", mountApp);
