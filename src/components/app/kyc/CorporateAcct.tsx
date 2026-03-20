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
import { Building, CalendarIcon, FileText, Upload } from "lucide-react";

const CorporateAcct = () => {
  const { createCorporateAcctForm, isPending, onSubmitCorporateAcct } =
    useKycHook();

  const [files, setFiles] = useState({
    cacCertificate: null as File | null,
    rcDocument: null as File | null,
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

  const handleSubmit = async (data: any) => {
    // Validate that all required files are uploaded
    if (
      !files.cacCertificate ||
      !files.rcDocument ||
      !files.utilityBill ||
      !files.directorID
    ) {
      alert("Please upload all required documents");
      return;
    }

    // TODO: Append files to FormData for API submission
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    // Call your existing submit handler
    await onSubmitCorporateAcct(data);
  };

  return (
    <div className="w-full flex justify-center items-start flex-col gap-6">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Building className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Corporate Account Verification
            </h2>
            <p className="text-sm text-gray-600">Account Limit: ₦100,000,000</p>
          </div>
        </div>
      </div>

      <Form {...createCorporateAcctForm}>
        <form
          className="w-full space-y-6"
          onSubmit={createCorporateAcctForm.handleSubmit(handleSubmit)}
        >
          {/* Business Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Business Information
            </h3>

            <FormField
              control={createCorporateAcctForm.control}
              name="business_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business name" {...field} />
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
                                <SelectItem key={year} value={year.toString()}>
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
                            date > new Date() || date < new Date("1900-01-01")
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
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Upload size={20} className="text-green-600" />
              Required Documents
            </h3>

            {/* CAC Certificate Upload */}
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

            {/* RC Document Upload */}
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

            {/* Utility Bill Upload */}
            <div>
              <FormLabel>Utility Bill (Proof of Address) *</FormLabel>
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

            {/* Director ID Upload */}
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
          </div>

          <Button type="submit" disabled={isPending} className="mt-4 w-full">
            {isPending ? <Spinner /> : "Submit Corporate Verification"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CorporateAcct;
