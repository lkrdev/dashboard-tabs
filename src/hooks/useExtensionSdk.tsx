import { ExtensionContext } from "@looker/extension-sdk-react";
import { useContext } from "react";

export default function useExtensionSdk() {
  const context = useContext(ExtensionContext);

  if (!context) {
    throw new Error("useSdk must be used within a LookerExtensionProvider");
  }

  return context.extensionSDK;
}
