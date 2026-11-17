import { Suspense } from "react";
import Subscriptions from "./Subscriptions";

// Subscriptions reads ?business_id (useSearchParams), which needs a boundary.
const page = () => {
  return (
    <Suspense>
      <Subscriptions />
    </Suspense>
  );
};

export default page;
