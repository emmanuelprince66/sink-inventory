// Bodies for the two wallet upgrade endpoints.
//
//   POST /wallet/upgrade_account/{id}/            individual — JSON
//   POST /wallet/upgrade_corporate_account/{id}/  corporate  — multipart
//
// Both are keyed on the business id, the same one wallet/create_bank_account/
// already takes.

import type { DirectorDetails } from "@/hooks/useKycHook";
import {
  CORPORATE_DOCUMENTS,
  DIRECTOR_DOCUMENTS,
  type CorporateDocKey,
} from "@/components/app/kyc/tiers";

/**
 * Individual upgrade: whichever of these the tier adds.
 *
 * bvn and nin are typed as integers in the schema but sent as the strings the
 * merchant typed. A NIN beginning with 0 is a real number — as an integer the
 * leading zero is gone and the check fails against a number nobody entered.
 */
export interface IndividualUpgradeBody {
  bvn?: string;
  nin?: string;
  address?: string;
}

export const buildIndividualUpgradeBody = (values: {
  bvn?: string;
  nin?: string;
  address?: string;
}): IndividualUpgradeBody => {
  const body: IndividualUpgradeBody = {};
  // Only what this tier actually adds — an empty string would fail the
  // schema's minLength rather than being ignored.
  if (values.bvn?.trim()) body.bvn = values.bvn.trim();
  if (values.nin?.trim()) body.nin = values.nin.trim();
  if (values.address?.trim()) body.address = values.address.trim();
  return body;
};

/**
 * Where one director's file goes in the multipart body: director_0_passport,
 * director_1_identification, and so on.
 *
 * Zero-indexed, and it has to stay that way. The backend's validation messages
 * count from one — "Director 1" is the entry sent as index 0 — so an error
 * naming a director is off by one from the key that carries their documents.
 */
export const directorFileField = (index: number, document: string) =>
  `director_${index}_${document}`;

export const buildCorporateUpgradeBody = ({
  tin,
  documents,
  directors,
}: {
  tin: string;
  documents: Record<CorporateDocKey, File | null>;
  directors: DirectorDetails[];
}): FormData => {
  const form = new FormData();

  form.append("tin", tin.trim());

  for (const doc of CORPORATE_DOCUMENTS) {
    const file = documents[doc.key];
    if (file) form.append(doc.key, file);
  }

  // One JSON object per director, appended under the same `directors` key —
  // not a single JSON array.
  //
  // The server reads them with getlist() and parses each entry, so an array
  // sent as one value arrives as a list nested inside the first slot and is
  // rejected with "Expected a dictionary of items but got type list". Repeated
  // keys are how multipart expresses a list, and that is what getlist() is
  // reading.
  //
  // Names and files are matched by position, so both are appended in the same
  // pass: building them in separate loops is how a director removed mid-form
  // ends up wearing the next one's passport.
  directors.forEach((director, index) => {
    form.append("directors", JSON.stringify({ fullname: director.name.trim() }));
    for (const doc of DIRECTOR_DOCUMENTS) {
      const file = director.files[doc.key];
      if (file) form.append(directorFileField(index, doc.key), file);
    }
  });

  return form;
};
