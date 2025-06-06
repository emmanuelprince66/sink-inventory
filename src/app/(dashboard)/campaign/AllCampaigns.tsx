import AllCampaignsTable from "./AllCampaignsTable";
import NoCampaign from "./NoCampaign";
const AllCampaigns = ({
  campaignsData,
  campaignsLoading,
}: {
  campaignsData: any;
  campaignsLoading: boolean;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {campaignsData?.data?.length > 0 && !campaignsLoading ? (
          <AllCampaignsTable response={campaignsData} loading={false} />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoCampaign />
          </div>
        )}
      </div>
    </>
  );
};

export default AllCampaigns;
