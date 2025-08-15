import { usePinHook } from "@/hooks/usePinHook";
import ChangePin from "../../transactions/ChangePin";
import Pin from "../../transactions/Pin";

const PinComp = () => {
  const { businessData } = usePinHook();
  console.log("businessData--", businessData?.pin);
  return (
    <div className="w-full">
      {businessData && businessData?.pin ? <ChangePin /> : <Pin />}
    </div>
  );
};

export default PinComp;
