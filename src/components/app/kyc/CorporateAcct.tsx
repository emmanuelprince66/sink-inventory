"use client";
import { useKycHook } from "@/hooks/useKycHook";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle,
  FileText,
  Shield,
  Upload,
} from "lucide-react";

const CorporateAcct = () => {
  const { createCorporateAcctForm, isPending, onSubmitCorporateAcct } =
    useKycHook();

  const [currentTier, setCurrentTier] = useState<1 | 2>(1);
  const [completedTiers, setCompletedTiers] = useState<number[]>([]);
  const [businessType, setBusinessType] = useState("");

  const [files, setFiles] = useState({
    cacCertificate: null as File | null,
    cacMemorandum: null as File | null,
    rcDocument: null as File | null,
    statusReport: null as File | null,
    boardResolution: null as File | null,
    proofOfAddress: null as File | null,
    utilityBill: null as File | null,
    directorID: null as File | null,
  });

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof typeof files,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({
        ...files,
        [fileType]: e.target.files[0],
      });
    }
  };

  const handleTierComplete = (tier: number) => {
    if (!completedTiers.includes(tier)) {
      setCompletedTiers([...completedTiers, tier]);
    }
  };

  const canAccessTier = (tier: number) => {
    if (tier === 1) return true;
    if (tier === 2) return completedTiers.includes(1);
    return false;
  };

  const handleTier1Submit = async (data: any) => {
    await onSubmitCorporateAcct(data);
    handleTierComplete(1);
  };

  const handleTier2Submit = async () => {
    if (
      !files.cacCertificate ||
      !files.cacMemorandum ||
      !files.rcDocument ||
      !files.statusReport ||
      !files.boardResolution ||
      !files.proofOfAddress ||
      !files.utilityBill ||
      !files.directorID
    ) {
      alert("Please upload all required documents");
      return;
    }

    if (!businessType) {
      alert("Please select a business type");
      return;
    }

    const formData = new FormData();
    const formValues = createCorporateAcctForm.getValues();
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    await onSubmitCorporateAcct(formValues);
    handleTierComplete(2);
  };

  return (
    <div className="w-full flex justify-center items-start flex-col gap-6">
      {/* Tier Progress Indicator */}
      <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Corporate Verification Progress
        </h3>
        <div className="space-y-3">
          {[
            {
              tier: 1,
              title: "Tier 1: Business Information",
              description: "Director & business details",
            },
            {
              tier: 2,
              title: "Tier 2: Document Verification",
              description: "CAC, memorandum, utility bill & more",
            },
          ].map((item) => (
            <div
              key={item.tier}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                currentTier === item.tier
                  ? "bg-white shadow-sm border-2 border-green-500 cursor-pointer"
                  : completedTiers.includes(item.tier)
                    ? "bg-green-50 border border-green-200 cursor-pointer"
                    : canAccessTier(item.tier)
                      ? "bg-white/50 border border-gray-200 cursor-pointer hover:border-green-300"
                      : "bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed"
              }`}
              onClick={() => {
                if (canAccessTier(item.tier)) {
                  setCurrentTier(item.tier as 1 | 2);
                }
              }}
            >
              <div>
                {completedTiers.includes(item.tier) ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : currentTier === item.tier ? (
                  <Shield className="text-green-600" size={24} />
                ) : (
                  <Shield className="text-gray-400" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </div>
              {!canAccessTier(item.tier) && (
                <div className="text-xs text-gray-500 font-medium">Locked</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier 1: Business Information Form */}
      {currentTier === 1 && (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-green-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">
              Tier 1: Business Information
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Provide director and business details to complete Tier 1
          </p>

          <Form {...createCorporateAcctForm}>
            <form
              className="w-full space-y-4"
              onSubmit={createCorporateAcctForm.handleSubmit(handleTier1Submit)}
            >
              <FormField
                control={createCorporateAcctForm.control}
                name="bvn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director's BVN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter director's BVN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={createCorporateAcctForm.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createCorporateAcctForm.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createCorporateAcctForm.control}
                name="dob"
                render={({ field }) => {
                  const [date, setDate] = useState<Date | undefined>(
                    field.value ? new Date(field.value) : undefined,
                  );
                  const [viewDate, setViewDate] = useState<Date>(
                    field.value ? new Date(field.value) : new Date(),
                  );
                  useEffect(() => {
                    if (field.value) {
                      const newDate = new Date(field.value);
                      setDate(newDate);
                      setViewDate(newDate);
                    } else {
                      setDate(undefined);
                      setViewDate(new Date());
                    }
                  }, [field.value]);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border border-primary-green-300",
                                !date && "text-muted-foreground",
                              )}
                            >
                              {date ? (
                                format(date, "PPP")
                              ) : (
                                <span>Pick date of birth</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 border border-gray-200"
                          align="start"
                        >
                          <div className="p-3 border-b z-10 bg-white flex items-center justify-between">
                            <Select
                              value={viewDate.getFullYear().toString()}
                              onValueChange={(value) => {
                                const year = parseInt(value);
                                const newViewDate = new Date(viewDate);
                                newViewDate.setFullYear(year);
                                setViewDate(newViewDate);
                              }}
                            >
                              <SelectTrigger className="w-[90px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(
                                  {
                                    length: new Date().getFullYear() - 1900 + 1,
                                  },
                                  (_, i) => 1900 + i,
                                ).map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                              setDate(selectedDate);
                              field.onChange(
                                selectedDate ? selectedDate.toISOString() : "",
                              );
                            }}
                            onMonthChange={setViewDate}
                            month={viewDate}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            className="rounded-md border border-gray-200 bg-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={createCorporateAcctForm.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your business name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createCorporateAcctForm.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RC/BN Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your registration number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createCorporateAcctForm.control}
                name="reg_date"
                render={({ field }) => {
                  const [date, setDate] = useState<Date | undefined>(
                    field.value ? new Date(field.value) : undefined,
                  );
                  const [viewDate, setViewDate] = useState<Date>(
                    field.value ? new Date(field.value) : new Date(),
                  );
                  useEffect(() => {
                    if (field.value) {
                      const newDate = new Date(field.value);
                      setDate(newDate);
                      setViewDate(newDate);
                    } else {
                      setDate(undefined);
                      setViewDate(new Date());
                    }
                  }, [field.value]);
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Registration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border border-primary-green-300",
                                !date && "text-muted-foreground",
                              )}
                            >
                              {date ? (
                                format(date, "PPP")
                              ) : (
                                <span>Pick registration date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 border border-gray-200"
                          align="start"
                        >
                          <div className="p-3 border-b z-10 bg-white flex items-center justify-between">
                            <Select
                              value={viewDate.getFullYear().toString()}
                              onValueChange={(value) => {
                                const year = parseInt(value);
                                const newViewDate = new Date(viewDate);
                                newViewDate.setFullYear(year);
                                setViewDate(newViewDate);
                              }}
                            >
                              <SelectTrigger className="w-[90px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(
                                  {
                                    length: new Date().getFullYear() - 1900 + 1,
                                  },
                                  (_, i) => 1900 + i,
                                ).map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                              setDate(selectedDate);
                              field.onChange(
                                selectedDate ? selectedDate.toISOString() : "",
                              );
                            }}
                            onMonthChange={setViewDate}
                            month={viewDate}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            className="rounded-md border border-gray-200 bg-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={createCorporateAcctForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter business address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createCorporateAcctForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border w-full border-primary-green-300">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
                          "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
                          "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
                          "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
                          "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
                          "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
                          "Taraba", "Yobe", "Zamfara",
                        ].map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="mt-4 w-full"
              >
                {isPending ? <Spinner /> : "Submit Tier 1"}
              </Button>
            </form>
          </Form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mt-6">
            <AlertCircle className="text-blue-600 shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">After Tier 1 completion:</p>
              <p>
                You can start using your account immediately or upgrade to Tier 2
                for full document verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tier 2: Document Upload Section */}
      {currentTier === 2 && (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-green-600" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">
              Tier 2: Document Verification
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Upload required business documents to complete full verification
          </p>

          {!completedTiers.includes(1) ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-yellow-600 shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                Please complete Tier 1 verification before proceeding to Tier 2.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Business Type */}
              <div>
                <FormLabel>Business Type *</FormLabel>
                <Select onValueChange={setBusinessType} value={businessType}>
                  <SelectTrigger className="border w-full border-primary-green-300 mt-2">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="LIMITED_LIABILITY">
                      Limited Liability
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CAC Certificate */}
              <div>
                <FormLabel>CAC Certificate *</FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload your Certificate of Incorporation from CAC
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "cacCertificate")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.cacCertificate && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.cacCertificate.name}
                    </div>
                  )}
                </div>
              </div>

              {/* CAC Memorandum */}
              <div>
                <FormLabel>
                  CAC Memorandum & Article of Association *
                </FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload your company's memorandum and article of association
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "cacMemorandum")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.cacMemorandum && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.cacMemorandum.name}
                    </div>
                  )}
                </div>
              </div>

              {/* RC Document */}
              <div>
                <FormLabel>RC/BN Document *</FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload your company registration document
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "rcDocument")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.rcDocument && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.rcDocument.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Report */}
              <div>
                <FormLabel>Status Report *</FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload your company status report
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "statusReport")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.statusReport && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.statusReport.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Board Resolution */}
              <div>
                <FormLabel>Board Resolution (Opening Account) *</FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload board resolution authorizing account opening
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileUpload(e, "boardResolution")
                          }
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.boardResolution && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.boardResolution.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Company Proof of Address */}
              <div>
                <FormLabel>Company Proof of Address *</FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload proof of company address
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileUpload(e, "proofOfAddress")
                          }
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.proofOfAddress && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.proofOfAddress.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Utility Bill */}
              <div>
                <FormLabel>Utility Bill *</FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Recent utility bill not older than 3 months
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "utilityBill")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.utilityBill && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.utilityBill.name}
                    </div>
                  )}
                </div>
              </div>

              {/* TIN */}
              <Form {...createCorporateAcctForm}>
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
              </Form>

              {/* Director ID */}
              <div>
                <FormLabel>
                  Director's ID (NIN/Voter's Card/Driver's License) *
                </FormLabel>
                <p className="text-xs text-gray-500 mb-3 mt-1">
                  Upload valid government-issued ID
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="text-gray-400" size={24} />
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <span className="text-green-600 font-medium hover:text-green-700">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "directorID")}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                  {files.directorID && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                      <FileText size={16} />
                      {files.directorID.name}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleTier2Submit}
                disabled={isPending}
                className="mt-4 w-full"
              >
                {isPending ? <Spinner /> : "Submit Tier 2 Documents"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Completion Status */}
      {completedTiers.length > 0 && (
        <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle
              className="text-green-600 shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <p className="font-medium text-green-800 mb-2">
                {completedTiers.length === 1 && "Tier 1 completed!"}
                {completedTiers.length === 2 && "All tiers completed!"}
              </p>
              <p className="text-sm text-green-700">
                {completedTiers.length < 2
                  ? "You can start using your account now or continue to Tier 2 for full document verification."
                  : "Congratulations! Your corporate account is fully verified."}
              </p>
            </div>
          </div>
          {completedTiers.length === 1 && canAccessTier(2) && (
            <button
              onClick={() => setCurrentTier(2)}
              className="mt-3 w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              Continue to Tier 2
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CorporateAcct;
