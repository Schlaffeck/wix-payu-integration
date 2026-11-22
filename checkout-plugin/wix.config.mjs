// @ts-check
import { defineWixConfig } from "@wix/cli/config";
import customExtensions from "@wix/custom-extensions/flow";
import zeroConfig from "@wix/cli-zero-config-flow";

// Fill these in from the app's page in the Wix Dev Center (see README.md).
const appId = "REPLACE_WITH_APP_ID";

export default defineWixConfig({
  flows: [
    customExtensions({
      appId,
      projectId: "checkout-plugin",
      namespace: "REPLACE_WITH_NAMESPACE",
      codeIdentifier: "REPLACE_WITH_CODE_IDENTIFIER",
    }),
    zeroConfig({ appId }),
  ],
});
