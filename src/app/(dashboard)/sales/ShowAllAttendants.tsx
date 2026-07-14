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
          <Skeleton className="h-10 w-full bg-grey-5" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full bg-grey-5 mt-2" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold text-grey-2 uppercase tracking-wide">
            Attendants
          </h3>
          <div className="divide-y divide-grey-6 rounded-xl border border-grey-5 bg-white overflow-hidden">
            {AttendantsData?.data?.map((attendant: any) => (
              <div
                key={attendant?.id}
                onClick={() => handleClickAttendants(attendant)}
                className={cn(
                  "px-4 py-3 transition-colors cursor-pointer",
                  "hover:bg-grey-6",
                  "focus:outline-none focus:ring-2 focus:ring-primary-green-300 focus:ring-offset-2"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-grey-1">{attendant?.name}</p>
                    {attendant?.email && (
                      <p className="text-sm font-medium text-grey-4">
                        {attendant.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full bg-success-2 px-2 py-1 text-xs font-extrabold text-success-1">
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
