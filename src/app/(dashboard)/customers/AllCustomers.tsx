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
  const hasCustomers = (customersData?.data?.results?.data?.length ?? 0) > 0;

  return (
    <div className="w-full">
      {hasCustomers && !customerLoading ? (
        <CustomerTable
          response={customersData}
          loading={false}
          setPage={setPage}
          page={page}
          handleRowClick={handleRowClick}
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <NoCustomer />
        </div>
      )}
    </div>
  );
};

export default AllCustomers;
