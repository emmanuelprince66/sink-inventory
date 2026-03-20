import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Tier2FormProps {
  onComplete: () => void;
}

interface Tier2FormData {
  bvn: string;
  nin: string;
}

const Tier2Form = ({ onComplete }: Tier2FormProps) => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<Tier2FormData>({
    defaultValues: {
      bvn: "",
      nin: "",
    },
  });

  const handleSubmit = async (data: Tier2FormData) => {
    setIsPending(true);
    try {
      // TODO: Replace with your actual API call
      console.log("Tier 2 data:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mark tier as complete
      onComplete();

      // Show success message
      alert("Tier 2 verification submitted successfully!");
    } catch (error) {
      console.error("Tier 2 submission error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="w-full space-y-5"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="bvn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Verification Number (BVN)</FormLabel>
              <FormControl>
                <Input placeholder="Enter 11-digit BVN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>National Identity Number (NIN)</FormLabel>
              <FormControl>
                <Input placeholder="Enter 11-digit NIN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="mt-4 w-full">
          {isPending ? <Spinner /> : "Submit Tier 2 Verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier2Form;
