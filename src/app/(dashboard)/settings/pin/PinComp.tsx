import { usePinHook } from "@/hooks/usePinHook";
import ChangePin from "../../transactions/ChangePin";
import Pin from "../../transactions/Pin";

const PinComp = () => {
  const { TrxData } = usePinHook();
  console.log("TrxData--", TrxData);
  return (
    <div className="w-full">
      {TrxData && TrxData?.data?.results?.pin ? <ChangePin /> : <Pin />}
    </div>
  );
};

export default PinComp;
