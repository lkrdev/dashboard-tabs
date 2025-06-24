import { ComponentsProvider } from "@looker/components";
import "@looker/embed-sdk";
import { ExtensionProvider } from "@looker/extension-sdk-react";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AppContextProvider } from "./AppContext";
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
    root = document.createElement("div");
    root.id = rootId;
    root.style.height = "100%";
    root.style.display = "flex";
    document.body.style.margin = "0";
    document.body.appendChild(root);
  }

  ReactDOM.render(
    <ExtensionProvider>
      <ComponentsProvider>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </ComponentsProvider>
    </ExtensionProvider>,
    root
  );
};

window.addEventListener("DOMContentLoaded", mountApp);
