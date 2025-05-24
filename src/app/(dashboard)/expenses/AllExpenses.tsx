import AllExpensesTable from "./AllExpensesTable";
import NoExpenses from "./NoExpenses";

const AllExpenses = ({
  expensesData,
  expensesLoading,
}: {
  expensesData: any;
  expensesLoading: any;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {expensesData?.data?.results?.data?.length > 0 && !expensesLoading ? (
          <AllExpensesTable response={expensesData} loading={false} />
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
