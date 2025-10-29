import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useEffect, useState } from "react";

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
}

interface FormErrors {
  [key: string]: string;
}

export const useStoreHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: BusinessData, isLoading: BusinessDataLoading } =
    useFetchBusinessById(business_id);

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
  };

  const [storeData, setStoreData] = useState<StoreData>(initialStoreData);
  const [formData, setFormData] = useState<StoreData>(initialStoreData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize store data from API
  useEffect(() => {
    if (findBusiness) {
      const storeUrl = `${window.location.origin}/store/${business_id}`;
      const data = {
        logo: findBusiness.logo || "/placeholder.svg?height=120&width=120",
        headerImage:
          findBusiness.header_image || "/placeholder.svg?height=300&width=1200",
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
        storeUrl: storeUrl,
      };
      setStoreData(data);
      setFormData(data);
    }
  }, [findBusiness, business_id]);

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!formData.businessSector) {
      newErrors.businessSector = "Business sector is required";
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
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State/Province is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
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
    }

    // Description length
    if (formData.description && formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof StoreData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted with values:", formData);
      setStoreData(formData);
      // TODO: Add API call to save data here
      // Example: updateBusiness(business_id, formData);
    }
  };

  // Handle cancel

  // Handle edit mode

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

  return {
    BusinessData,
    BusinessDataLoading,
    business_id,
    storeData,
    formData,
    errors,
    copySuccess,
    handleInputChange,
    handleSubmit,
    copyStoreUrl,
  };
};
