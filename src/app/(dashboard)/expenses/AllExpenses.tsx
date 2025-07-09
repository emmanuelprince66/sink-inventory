import AllExpensesTable from "./AllExpensesTable";
import NoExpenses from "./NoExpenses";

const AllExpenses = ({
  expensesData,
  expensesLoading,
  setPage,
  page,
}: {
  expensesData: any;
  expensesLoading: any;
  setPage: (page: number) => void;
  page: number;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {expensesData?.data?.results?.data?.length > 0 && !expensesLoading ? (
          <AllExpensesTable
            setPage={setPage}
            page={page}
            response={expensesData}
            loading={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoExpenses />
          </div>
        )}
      </div>
    </>
  );
};

export default AllExpenses;
