import CustomerTable from "./CustomerTable";
import NoCustomer from "./NoCustomer";
import { ApiResponse, CustomerResponse } from "./types";

const AllCustomers = ({
  customersData,
  customerLoading,
  handleRowClick,
  setPage,
  page,
}: {
  customersData: ApiResponse<CustomerResponse>;
  handleRowClick?: (row: any) => void; // Define the type of row if possible
  customerLoading?: boolean;
  setPage: (page: number) => void;
  page: number;
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
          setPage={setPage}
          page={page}
          handleRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default AllCustomers;
