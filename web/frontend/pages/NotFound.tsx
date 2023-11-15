import { EmptyState, Page } from "@shopify/polaris";
import { notFoundImage } from "../assets";

export default function NotFound() {
  return (
    <Page>
        <EmptyState
            heading="There is no page at this address"
            image={notFoundImage}
          >
            <p>
              Check the URL and try again, or use the search bar to find what
              you need.
            </p>
        </EmptyState>
    </Page>
  );
}
