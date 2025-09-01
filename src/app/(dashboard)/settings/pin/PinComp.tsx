import { usePinHook } from "@/hooks/usePinHook";
import { useState } from "react";
import ChangePin from "../../transactions/ChangePin";
import ForgetPin from "../../transactions/ForgetPin";
import Pin from "../../transactions/Pin";

// Define the possible states for the pin flow
type PinState = "create" | "change" | "forget";

const PinComp = () => {
  const { businessData } = usePinHook();
  const initialState = businessData?.pin ? "change" : "create";

  console.log("Initial Pin State:", initialState);

  const [pinState, setPinState] = useState<PinState>(initialState);

  // Determine initial state based on business data

  // Function to render the appropriate component based on state
  const renderPinComponent = () => {
    switch (pinState) {
      case "create":
        return <Pin onSuccess={() => setPinState("create")} />;
      case "change":
        return (
          <ChangePin
            onForgetPin={() => setPinState("forget")}
            onSuccess={() => setPinState("change")}
          />
        );
      case "forget":
        return <ForgetPin onSuccess={() => setPinState("change")} />;
      default:
        return <Pin onSuccess={() => setPinState("change")} />;
    }
  };

  return <div className="w-full">{renderPinComponent()}</div>;
};

export default PinComp;
