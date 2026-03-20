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
import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Tier3FormProps {
  onComplete: () => void;
}

interface Tier3FormData {
  proofOfAddress: File | null;
}

const Tier3Form = ({ onComplete }: Tier3FormProps) => {
  const [isPending, setIsPending] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<Tier3FormData>({
    defaultValues: {
      proofOfAddress: null,
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      form.setValue("proofOfAddress", file);
    }
  };

  const handleSubmit = async (data: Tier3FormData) => {
    if (!uploadedFile) {
      alert("Please upload a proof of address document");
      return;
    }

    setIsPending(true);
    try {
      // TODO: Replace with your actual file upload API call
      const formData = new FormData();
      formData.append("proofOfAddress", uploadedFile);

      console.log("Tier 3 data:", { fileName: uploadedFile.name });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark tier as complete
      onComplete();

      // Show success message
      alert("Tier 3 verification submitted successfully!");
    } catch (error) {
      console.error("Tier 3 submission error:", error);
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
          name="proofOfAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proof of Address</FormLabel>
              <p className="text-xs text-gray-500 mb-3">
                Upload a recent utility bill (electricity, water, gas) or bank
                statement not older than 3 months
              </p>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <label className="cursor-pointer">
                    <span className="text-green-600 font-medium hover:text-green-700">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, JPG, or PNG (max 5MB)
                  </p>
                  {uploadedFile && (
                    <div className="mt-3 text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                      <FileText size={16} />
                      {uploadedFile.name}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending || !uploadedFile}
          className="mt-4 w-full"
        >
          {isPending ? <Spinner /> : "Submit Tier 3 Verification"}
        </Button>
      </form>
    </Form>
  );
};

export default Tier3Form;
