import CustomerTable from "./CustomerTable";
import NoCustomer from "./NoCustomer";
import { ApiResponse, CustomerResponse } from "./types";

const AllCustomers = ({
  customersData,
  customerLoading,
  handleRowClick,
}: {
  customersData: ApiResponse<CustomerResponse>;
  handleRowClick?: (row: any) => void; // Define the type of row if possible
  customerLoading?: boolean;
}) => {
  if (!customersData && !customerLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center mt-8">
        <NoCustomer />
      </div>
    );
  }
  return (
    <div className="w-full">
      {customersData?.data?.results?.data?.length > 0 && !customerLoading && (
        <CustomerTable
          response={customersData}
          loading={false}
          handleRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default AllCustomers;
