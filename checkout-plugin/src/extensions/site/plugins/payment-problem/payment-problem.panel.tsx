// Editor settings panel. The plugin has nothing to configure: it takes its
// colours from the checkout theme (slotBrand) and its text from the payment status.
import React, { type FC } from "react";
import { SidePanel, WixDesignSystemProvider, Text } from "@wix/design-system";
import "@wix/design-system/styles.global.css";

const Panel: FC = () => (
  <WixDesignSystemProvider>
    <SidePanel width="300">
      <SidePanel.Content>
        <Text size="small">
          Shows a popup on checkout after a failed or canceled payment. The colours
          follow the checkout design and there is nothing to set up here.
        </Text>
      </SidePanel.Content>
    </SidePanel>
  </WixDesignSystemProvider>
);

export default Panel;
