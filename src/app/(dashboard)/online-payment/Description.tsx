import { Button } from "@/components/ui/button";
import Link from "next/link";

const Description = () => {
  return (
    <div className="text-center py-10 px-4">
      <p className="text-lg text-muted-foreground mb-6">
        Complete your KYC verification to enable online payments.
      </p>
      <Button className="text-black" asChild size="lg">
        <Link className="text-black" href="/kyc">
          Complete KYC Now
        </Link>
      </Button>
    </div>
  );
};

export default Description;
