import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for class merging

const ShowAllAttendants = ({
  handleClickAttendants,
  AttendantsLoading,
  AttendantsData,
}: {
  handleClickAttendants: any;
  AttendantsLoading: any;
  AttendantsData: any;
}) => {
  return (
    <div className="flex w-full flex-col gap-3">
      {AttendantsLoading || !AttendantsData ? (
        <div className="space-y-4 flex flex-col">
          <Skeleton className="h-10 w-full bg-[#eef4ef]" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-700">Attendants</h3>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {AttendantsData?.data?.map((attendant: any) => (
              <div
                key={attendant?.id}
                onClick={() => handleClickAttendants(attendant)}
                className={cn(
                  "px-4 py-3 transition-all duration-200",
                  "hover:bg-gray-50 hover:shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "first:rounded-t-lg last:rounded-b-lg"
                )}
              >
                <div className="flex items-center cursor-pointer justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {attendant?.name}
                    </p>
                    {attendant?.email && (
                      <p className="text-sm text-gray-500">{attendant.email}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowAllAttendants;
