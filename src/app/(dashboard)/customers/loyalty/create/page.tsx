import type { Metadata } from "next";
import CreateLoyaltyPage from "./CreateLoyaltyPage";

export const metadata: Metadata = {
  title: "Create loyalty programme",
};

// A full page rather than a modal: nine steps plus the QR card handover is too
// much for a dialog, and a page gives the flow its own URL to return to.
const Page = () => <CreateLoyaltyPage />;

export default Page;
