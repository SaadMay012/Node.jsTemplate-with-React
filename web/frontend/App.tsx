import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { AppBridgeProvider, QueryProvider, PolarisProvider } from "./providers";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { ShopContextProvider } from "./hooks";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages: any = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            {/* We can use it for Global Billing Context */}
            <ShopContextProvider>
              <LoadingIndicator />
              <NavigationMenu
                navigationLinks={[
                  {
                    label: "Page name",
                    destination: "/pagename",
                  },
                ]}
              />
              <Routes pages={pages} />
            </ShopContextProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
