import { PermissionGuard } from "@/components/app/PermissionGuard";
import Transactions from "./Transactions";

const page = () => {
  return (
    <>
      <PermissionGuard permission="view_transactions">
        <Transactions />
      </PermissionGuard>
    </>
  );
};

export default page;
