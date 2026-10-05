"use client";

import { CustomModal } from "@/components/app/CustomModal";
import AddCustomer from "../AddCustomer";
import type { CustomerType } from "../types";

const EditCustomer = ({
  customer,
  isOpen,
  onClose,
}: {
  customer: CustomerType;
  isOpen: boolean;
  onClose: () => void;
}) => (
  <CustomModal
    isOpen={isOpen}
    onClose={onClose}
    trigger={false}
    title="Edit Customer"
    description="Update this customer's contact details and address."
    size="lg"
  >
    <AddCustomer
      customer={customer}
      closeOpenCustomerModal={onClose}
    />
  </CustomModal>
);

export default EditCustomer;
