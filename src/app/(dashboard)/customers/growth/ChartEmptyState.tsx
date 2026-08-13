import { BarChart3 } from "lucide-react";

// Shown instead of a chart when the API returns no points for the selected
// month. Deliberately not a sample series — on an analytics screen an invented
// trend line is indistinguishable from a real one.
const ChartEmptyState = ({
  height = 180,
  message = "No data for this month",
}: {
  height?: number;
  message?: string;
}) => (
  <div
    className="flex flex-col items-center justify-center gap-2 text-center rounded-xl border border-dashed border-grey-5 bg-grey-6/30"
    style={{ height }}
  >
    <BarChart3 className="w-5 h-5 text-grey-4" />
    <p className="text-xs text-grey-3 px-4">{message}</p>
  </div>
);

export default ChartEmptyState;
