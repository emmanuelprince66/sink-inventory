import { Briefcase, Check, User } from "lucide-react";
import { useState } from "react";
import CorporateAcct from "./CorporateAcct";
import IndividualAcct from "./IndividualAcct";

const KycConfirm = () => {
  const [selectedTier, setSelectedTier] = useState<any>();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    bvn: "",
    businessName: "",
    cacNumber: "",
    incorporationDate: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className=" mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Choose a tier to get started
      </h1>

      <p className="text-gray-600 mb-6">
        Due to recent regulatory requirements from the Central Bank of Nigeria,
        all Sync Users are required to verify their identity before receiving
        settlement.
      </p>

      {!selectedTier ? (
        <div className="space-y-4 mb-8">
          {/* Tier 1 Card */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTier === "tier1"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }`}
            onClick={() => setSelectedTier("tier1")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    selectedTier === "tier1"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Individual Account
                  </h3>
                  <p className="text-sm text-gray-500">
                    Account can be opened with just BVN
                  </p>
                </div>
              </div>
              {selectedTier === "tier1" && (
                <Check className="text-green-600" size={20} />
              )}
            </div>
            <div className="mt-4 pl-11">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Daily settlement limit:</span>
                <span className="ml-1">Unlimited</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Receive settlement in:</span>
                <span className="ml-1">Personal Account</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Documents required:</span>
                <span className="ml-1">BVN</span>
              </div>
            </div>
          </div>

          {/* Tier 2 Card */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTier === "tier2"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300"
            }`}
            onClick={() => setSelectedTier("tier2")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    selectedTier === "tier2"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Corporate Account
                  </h3>
                  <p className="text-sm text-gray-500">
                    Picking this Option means you have a CAC certificate
                  </p>
                </div>
              </div>
              {selectedTier === "tier2" && (
                <Check className="text-green-600" size={20} />
              )}
            </div>
            <div className="mt-4 pl-11">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Daily settlement limit:</span>
                <span className="ml-1">Unlimited</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <span className="font-medium">Receive settlement in:</span>
                <span className="ml-1">Personal/Business Account</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Documents required:</span>
                <span className="ml-1">BVN, CAC Verification</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedTier === "tier1" ? (
            <>
              <IndividualAcct />
            </>
          ) : (
            <>
              <CorporateAcct />
            </>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        Verified by Third Party Providers
      </div>
    </div>
  );
};

export default KycConfirm;
