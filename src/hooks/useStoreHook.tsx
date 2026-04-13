import { useUpdateBusinessMutation } from "@/api/business/create-business";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useEffect, useRef, useState } from "react";
import { useToast } from "./toast/useToast";

const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.7,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

interface StoreData {
  logo: string;
  headerImage: string;
  storeName: string;
  businessName: string;
  businessSector: string;
  tagline: string | null;
  description: string | null;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  currency: string;
  storeUrl: string;
  inStoreUrl?: string;
  slugUrl?: string;
  messageSubscription?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

// Currency options from schema
export const CURRENCY_OPTIONS = [
  "NGN",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "CNY",
  "INR",
  "RUB",
  "BRL",
  "ZAR",
  "MXN",
  "SGD",
  "HKD",
  "SEK",
  "KES",
  "GHS",
] as const;

// Business sector options from schema
export const BUSINESS_SECTOR_OPTIONS = [
  "Food & Restaurant",
  "Beauty & Personal Care",
  "Book & Stationery",
  "Minimart & Retail",
  "Electronics & Gadget",
  "Laundry",
  "Salon Business",
  "Pharmacy & Health Products",
  "Home & Furniture",
  "Construction Material & Suppliers",
  "Logistics & Others",
] as const;

export const useStoreHook = ({ setIsEditing }: { setIsEditing: any }) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    refetch,
  } = useFetchBusinessById(business_id);

  const findBusiness = BusinessData?.data;

  const initialStoreData: StoreData = {
    logo: "/placeholder.svg?height=120&width=120",
    headerImage: "/placeholder.svg?height=300&width=1200",
    storeName: "",
    businessName: "",
    businessSector: "",
    tagline: null,
    description: null,
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    currency: "",
    storeUrl: "",
    messageSubscription: false,
  };

  const [storeData, setStoreData] = useState<StoreData>(initialStoreData);
  const [formData, setFormData] = useState<StoreData>(initialStoreData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Image handling states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(initialStoreData.logo);
  const [bannerPreview, setBannerPreview] = useState(
    initialStoreData.headerImage
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateBusiness, isPending } = useUpdateBusinessMutation({
    onSuccess: (data) => {
      console.log("Business updated successfully:", data);
      setStoreData(formData);
      setIsSubmitting(false);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Failed to update business:", error);
      setIsSubmitting(false);
    },
  });

  console.log("findBusiness", findBusiness);

  // Initialize store data from API
  useEffect(() => {
    if (findBusiness) {
      const baseUrl = "https://store.sync360.africa";
      const slugUrl = findBusiness.store_url || "";
      const outStoreUrl = `${baseUrl}/o/${slugUrl}`;
      const inStoreUrl = `${baseUrl}/i/${slugUrl}`;

      const data = {
        logo: findBusiness.logo || "/placeholder.svg?height=120&width=120",
        headerImage:
          findBusiness.banner || "/placeholder.svg?height=300&width=1200",
        storeName: findBusiness.name || "",
        businessName: findBusiness.name || "",
        businessSector: findBusiness.type || "",
        tagline: findBusiness.tag_line || null,
        description: findBusiness.description || null,
        phone: findBusiness.owner?.phone || "",
        email: findBusiness.owner?.email || "",
        address: findBusiness.street || "",
        city: findBusiness.city || "",
        state: findBusiness.state || "",
        country: findBusiness.country || "",
        zipCode: findBusiness.zip_code || "",
        currency: findBusiness.currency || "",
        storeUrl: outStoreUrl,
        inStoreUrl: inStoreUrl,
        slugUrl: slugUrl,
        messageSubscription: findBusiness.message_subscription || false,
      };
      setStoreData(data);
      setFormData(data);
      setLogoPreview(data.logo);
      setBannerPreview(data.headerImage);
    }
  }, [findBusiness, business_id]);

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    } else if (formData.storeName.length > 250) {
      newErrors.storeName = "Store name must not exceed 250 characters";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    } else if (formData.businessName.length > 250) {
      newErrors.businessName = "Business name must not exceed 250 characters";
    }

    if (!formData.businessSector) {
      newErrors.businessSector = "Business sector is required";
    } else if (
      !BUSINESS_SECTOR_OPTIONS.includes(formData.businessSector as any)
    ) {
      newErrors.businessSector = "Invalid business sector selected";
    }

    // Phone validation
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact phone is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Street address is required";
    } else if (formData.address.length > 100) {
      newErrors.address = "Street address must not exceed 100 characters";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.length > 50) {
      newErrors.country = "Country must not exceed 50 characters";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State/Province is required";
    } else if (formData.state.length > 50) {
      newErrors.state = "State must not exceed 50 characters";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.length > 100) {
      newErrors.city = "City must not exceed 100 characters";
    }

    // Zip code validation (optional but validates format if provided)
    if (formData.zipCode && formData.country === "United States") {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.zipCode)) {
        newErrors.zipCode = "Invalid US zip code format";
      }
    }

    // Currency validation
    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    } else if (!CURRENCY_OPTIONS.includes(formData.currency as any)) {
      newErrors.currency = "Invalid currency selected";
    }

    // Tagline validation (optional, max 150 characters)
    if (formData.tagline && formData.tagline.length > 150) {
      newErrors.tagline = "Tagline must not exceed 150 characters";
    }

    // Description length
    if (formData.description && formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    field: keyof StoreData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle logo change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        logo: "Please upload a valid image file",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: "Image size must be less than 5MB",
      }));
      return;
    }

    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    handleInputChange("logo", previewUrl);
  };

  // Handle banner change with compression
  const handleBannerChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        headerImage: "Please upload a valid image file",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        headerImage: "Image size must be less than 5MB",
      }));
      return;
    }

    try {
      const compressed = await compressImage(file, 1200, 0.7);
      setBannerFile(compressed);
      const previewUrl = URL.createObjectURL(compressed);
      setBannerPreview(previewUrl);
      handleInputChange("headerImage", previewUrl);
    } catch {
      // Fallback to original if compression fails
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      handleInputChange("headerImage", previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();

      // Add business_id
      formDataToSend.append("business_id", business_id as string);

      // Add text fields according to schema (handle null values)
      formDataToSend.append("name", formData.businessName);
      formDataToSend.append("type", formData.businessSector);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("street", formData.address);
      formDataToSend.append("currency", formData.currency);

      // Optional fields - only append if they have values
      if (formData.tagline) {
        formDataToSend.append("tag_line", formData.tagline);
      }
      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }
      if (formData.zipCode) {
        formDataToSend.append("zip_code", formData.zipCode);
      }
      if (formData.messageSubscription !== undefined) {
        formDataToSend.append(
          "message_subscription",
          String(formData.messageSubscription)
        );
      }

      // Add image files if provided
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }
      if (bannerFile) {
        formDataToSend.append("banner", bannerFile);
      }

      console.log("Submitting form data:", formData);

      // Call the mutation
      updateBusiness(formDataToSend, {
        onSuccess: (data) => {
          showToast(data?.message, "success");
          console.log("Business updated successfully:", data);
          setStoreData(formData);
          setIsSubmitting(false);
          setIsEditing(false);
          refetch();
        },
        onError: (error) => {
          showToast("Something went wrong. please try again!", "error");
          console.error("Error submitting form:", error);
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Copy store URL
  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeData.storeUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Reset form to original data
  const handleCancel = () => {
    setFormData(storeData);
    setErrors({});
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview(storeData.logo);
    setBannerPreview(storeData.headerImage);
  };

  // Handle edit mode

  return {
    BusinessData,
    BusinessDataLoading,
    business_id,
    storeData,
    formData,
    errors,
    copySuccess,
    isSubmitting: isSubmitting || isPending,
    logoFile,
    bannerFile,
    logoPreview,
    bannerPreview,
    logoInputRef,
    bannerInputRef,
    handleInputChange,
    handleSubmit,
    handleLogoChange,
    handleBannerChange,
    handleCancel,
    copyStoreUrl,
    CURRENCY_OPTIONS,
    BUSINESS_SECTOR_OPTIONS,
  };
};
