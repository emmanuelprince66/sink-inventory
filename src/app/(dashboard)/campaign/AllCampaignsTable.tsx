import { CustomTable } from "@/components/app/CutomTable";
import { columns } from "./CampaignColumn";

const AllCampaignsTable = ({
  response,
  loading,
}: {
  response: any;
  loading: any;
}) => {
  return (
    <>
      <CustomTable
        loading={loading}
        noDataText="No Campaign found"
        columns={columns}
        data={response?.data}
      />
    </>
  );
};

export default AllCampaignsTable;
