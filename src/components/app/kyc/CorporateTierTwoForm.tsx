"use client";

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
import { useKycHook } from "@/hooks/useKycHook";
import { Plus } from "lucide-react";
import DirectorCard from "./DirectorCard";
import FileUploadField from "./FileUploadField";
import { Notice, SectionHeading } from "./KycUi";
import { CORPORATE_DOCUMENTS } from "./tiers";

interface CorporateTier2FormProps {
  onComplete: () => void;
  kyc: ReturnType<typeof useKycHook>;
}

/**
 * Corporate Tier 2: the TIN, the company's legal filings, and a record for
 * every director. The director list is dynamic — one is required, and
 * [Add director] appends another card with its own name and two uploads.
 *
 * Business type is not here: create_bank_account needs it to open the account
 * at Tier 1, so that is where it is asked for.
 */
const CorporateTier2Form = ({ onComplete, kyc }: CorporateTier2FormProps) => {
  const {
    createCorporateAcctForm,
    isPending,
    submitCorporateTier,
    corporateDocs,
    setCorporateDoc,
    corporateDocErrors,
    corporateDocsCount,
    directors,
    directorErrors,
    addDirector,
    removeDirector,
    updateDirector,
    updateDirectorFile,
  } = kyc;

  const handleSubmit = async () => {
    const ok = await submitCorporateTier(2);
    if (ok) onComplete();
  };

  return (
    <Form {...createCorporateAcctForm}>
      <form
        className="w-full space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-4">
          <SectionHeading
            title="Tax"
            description="The business's tax identification number."
          />

          <div>
            <FormField
              control={createCorporateAcctForm.control}
              name="tin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Identification Number (TIN)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter TIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            title="Company documents"
            description="Clear scans or photos — every page must be readable."
            meta={`${corporateDocsCount} of ${CORPORATE_DOCUMENTS.length} uploaded`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {CORPORATE_DOCUMENTS.map((doc) => (
              <FileUploadField
                key={doc.key}
                id={`corporate-${doc.key}`}
                label={doc.label}
                hint={doc.hint}
                accept={doc.accept}
                value={corporateDocs[doc.key]}
                onChange={(file) => setCorporateDoc(doc.key, file)}
                error={corporateDocErrors[doc.key]}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            title="Director details"
            description="Every director on the CAC filing needs their own record. At least one is required."
            meta={`${directors.length} ${
              directors.length === 1 ? "director" : "directors"
            }`}
          />

          <div className="space-y-4">
            {directors.map((director, index) => (
              <DirectorCard
                key={director.id}
                director={director}
                index={index}
                canRemove={directors.length > 1}
                errors={directorErrors[director.id]}
                onChange={(field, value) =>
                  updateDirector(director.id, field, value)
                }
                onFileChange={(key, file) =>
                  updateDirectorFile(director.id, key, file)
                }
                onRemove={() => removeDirector(director.id)}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addDirector}
            className="h-12 w-full border-dashed border-primary-green-300 text-primary-green-300 hover:bg-secondary-6/50 hover:text-primary-green-300"
          >
            <Plus size={16} />
            Add director
          </Button>
        </div>

        <Notice>
          Document review usually takes 1–3 business days. You keep your Tier 1
          limit while the review is running, and we will email every director
          listed here if anything needs re-uploading.
        </Notice>

        <Button type="submit" disabled={isPending} size="lg" className="w-full">
          {isPending ? <Spinner /> : "Submit Tier 2 verification"}
        </Button>
      </form>
    </Form>
  );
};

export default CorporateTier2Form;
