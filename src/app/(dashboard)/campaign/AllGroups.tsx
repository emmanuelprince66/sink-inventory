import AllGroupsTable from "./AllGroupsTable";
import NoGroups from "./NoGroups";

const AllGroups = ({
  groupData,
  groupLoading,
}: {
  groupData: any;
  groupLoading: boolean;
}) => {
  return (
    <>
      <>
        <div className="w-full mt-3">
          {groupData?.data?.length > 0 && !groupLoading ? (
            <AllGroupsTable response={groupData} loading={false} />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center mt-8">
              <NoGroups />
            </div>
          )}
        </div>
      </>
    </>
  );
};

export default AllGroups;
