import { Page, Layout, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export default function PageName() {
  return (
    <Page>
      <TitleBar
        title="Page name"
        primaryAction={{
          content: "Primary action",
          onAction: () => console.log("Primary action"),
        }}
        secondaryActions={[
          {
            content: "Secondary action",
            onAction: () => console.log("Secondary action"),
          },
        ]}
      />
      <Layout>
        <Layout.Section>
            <Text variant="headingMd" as="h2">
              Heading
            </Text>
              <p>Body</p>
            <Text variant="headingMd" as="h2">
              Heading
            </Text>
              <p>Body</p>
        </Layout.Section>
        <Layout.Section >
            <Text variant="headingMd" as="h2">
              Heading
            </Text>
              <p>Body</p>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
