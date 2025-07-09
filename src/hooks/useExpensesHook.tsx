import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useCreateExpensesMutation } from "@/api/expenses/create-expenses";
import { useDeleteExpenseMutation } from "@/api/expenses/delete-expenses";
import { useEditExpenseMutation } from "@/api/expenses/edit-expense";
import { useFetchExpensesByIdQuery } from "@/api/expenses/fetch-expense-by-id";
import { useFetchExpensesQuery } from "@/api/expenses/fetch-expenses";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

const addExpenseSchema = z.object({
  name: z.string().min(1, "Supply name is required"),
  category_id: z.string().min(1, "Category  is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

export type AddExpenseFormValues = z.infer<typeof addExpenseSchema>;

const editExpenseSchema = z.object({
  name: z.string().min(1, "Supply name is required"),
  category_id: z.string().min(1, "Category  is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

export type editExpenseFormValues = z.infer<typeof editExpenseSchema>;

export const useExpensesHook = ({
  searchInput,
  selectedCategory,
  closeModal,
  dateRange,
  page,

  handleOpenNotSubscribeModal,
}: {
  searchInput?: any;
  dateRange?: DateRange | undefined;
  selectedCategory?: string | null;
  closeModal?: () => void;
  page?: number;

  handleOpenNotSubscribeModal?: () => void;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();
  const params = useParams();
  const expenseId = params.id as string;
  const isUserSubscribed = useIsUserSubscribeStore(
    (state) => state.is_subscribed
  );

  const { user } = useUserRole();

  // console.log("expenseId", expenseId);

  const { mutate: deleteExpense, isPending: deleteExpenseLoading } =
    useDeleteExpenseMutation({
      onSuccess: (data) => {
        showToast(data.message, "success");
        ExpensesDataRefetch();

        if (closeModal) closeModal();

        // if (closeModal) closeModal();
        // Optional: Invalidate queries or update cache
      },
      // You can add other callbacks here if needed
    });

  const {
    data: ExpenseData,
    isLoading: ExpenseDataLoading,
    refetch: ExpensesDataRefetch,
  } = useFetchExpensesByIdQuery(expenseId, { enabled: !!expenseId });

  // console.log("ExpenseData----333", ExpenseData);

  const { mutate: editExpense, isPending: editExpenseLoading } =
    useEditExpenseMutation();

  const { mutate: createExpenses, isPending: createExpensesLoading } =
    useCreateExpensesMutation({
      businessId: business_id, // Convert null to undefined
      onSuccess: (data) => {
        showToast(data.message, "success");
        ExpensesDataRefetch();
        if (closeModal) closeModal();

        // Optional: Invalidate queries or update cache
      },
    });
  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      name: "",
      category_id: "",
      amount: "",
      date: "",
      note: "",
    },
    mode: "onChange",
  });
  const editForm = useForm<editExpenseFormValues>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      name: "",
      category_id: "",
      amount: "",
      date: "",
      note: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: AddExpenseFormValues) => {
    try {
      // Validate amount is a number

      if (!isUserSubscribed?.is_subscribed && user?.role === "OWNER") {
        handleOpenNotSubscribeModal?.();
        return;
      }
      const amount = Number(values.amount);
      if (isNaN(amount)) {
        throw new Error("Amount must be a valid number");
      }

      // Format date using moment
      let formattedDate: string;
      if (values.date) {
        formattedDate = moment(values.date).format("YYYY-MM-DD");

        // Validate the formatted date
        if (!moment(formattedDate, "YYYY-MM-DD", true).isValid()) {
          throw new Error("Invalid date format");
        }
      } else {
        throw new Error("Date is required");
      }

      // Create payload
      const payload: {
        name: string;
        category_id: string | number;
        amount: number;
        date: string;
        note?: string;
      } = {
        name: values.name,
        category_id: values.category_id,
        amount: amount,
        date: formattedDate,
      };

      // Only add note if it exists and isn't empty
      if (values.note?.trim()) {
        payload.note = values.note.trim();
      }

      console.log("Valid payload:", payload);
      createExpenses({ payload, businessId: business_id });
    } catch (error) {
      console.error("Validation error:", error);
      // Handle error (show toast, set form error, etc.)
      throw error;
    }
  };
  const onSubmitEditForm = (values: editExpenseFormValues) => {
    try {
      // Validate amount is a number
      const amount = Number(values.amount);
      if (isNaN(amount)) {
        throw new Error("Amount must be a valid number");
      }

      // Format date using moment
      let formattedDate: string;
      if (values.date) {
        formattedDate = moment(values.date).format("YYYY-MM-DD");

        // Validate the formatted date
        if (!moment(formattedDate, "YYYY-MM-DD", true).isValid()) {
          throw new Error("Invalid date format");
        }
      } else {
        throw new Error("Date is required");
      }

      // Create payload
      const payload: {
        name: string;
        category_id: string;
        amount: number;
        date: string;
        note?: string;
      } = {
        name: values.name,
        category_id: values.category_id,
        amount: amount,
        date: formattedDate,
      };

      // Only add note if it exists and isn't empty
      if (values.note?.trim()) {
        payload.note = values.note.trim();
      }

      editExpense({
        expenseId: expenseId,
        payload,
      });
    } catch (error) {
      console.error("Validation error:", error);
      // Handle error (show toast, set form error, etc.)
      throw error;
    }
  };
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  const {
    data: ExpensesData,
    isLoading: ExpensesLoading,
    refetch: refetchExpenses,
  } = useFetchExpensesQuery({
    params: {
      id: business_id,
      category: selectedCategory,
      search: searchTerm,
      limit: 30,
      page,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
  });

  const handleDeleteExpense = (expense: any) => {
    deleteExpense(expense?.id);
  };

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "EXPENSES",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  useEffect(() => {
    if (expenseId && ExpenseData && !ExpenseDataLoading) {
      const initialValues = {
        name: ExpenseData?.data?.name || "",
        category_id: ExpenseData?.data?.category?.id || "",
        amount: ExpenseData?.data?.amount?.toString() || "",
        date: ExpenseData?.data?.date || "",
        note: ExpenseData?.data?.note || "",
      };

      editForm.reset(initialValues);
    }
  }, [expenseId, ExpenseData, ExpenseDataLoading, editForm]);

  // console.log("ExpensesData", ExpensesData);
  // console.log("CategoriesData", CategoriesData);
  return {
    ExpensesData,
    ExpensesLoading,
    CategoriesDataLoading,
    ExpenseData,
    ExpenseDataLoading,
    onSubmitEditForm,
    editForm,
    editExpenseLoading,
    CategoriesData,
    onSubmit,
    handleDeleteExpense,
    deleteExpenseLoading,
    createExpensesLoading,
    form,
  };
};
