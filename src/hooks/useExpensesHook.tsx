import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useCreateExpensesMutation } from "@/api/expenses/create-expenses";
import { useDeleteExpenseMutation } from "@/api/expenses/delete-expenses";
import { useEditExpenseMutation } from "@/api/expenses/edit-expense";
import { useFetchExpensesByIdQuery } from "@/api/expenses/fetch-expense-by-id";
import { useFetchExpensesQuery } from "@/api/expenses/fetch-expenses";
import { queryKey } from "@/constants/query-key";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useUserRole } from "@/lib/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";
import { entryTypeOf } from "@/types/expense-governance";

const ENTRY_TYPE_VALUES = ["EXPENSE", "PURCHASE", "TRANSFER"] as const;

/** Every line needs a category, except on a TRANSFER. */
const requireCategory = (
  entryType: string,
  categoryId: string | undefined,
  context: z.RefinementCtx,
  path: (string | number)[],
) => {
  if (entryType !== "TRANSFER" && !categoryId) {
    context.addIssue({ code: "custom", message: "Category  is required", path });
  }
};

const expenseLineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category_id: z.string(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number(value) > 0, "Enter an amount above zero"),
});

/**
 * One or more lines logged together, sharing a type, date and note. A single
 * line goes up as a plain entry; several go up as the bulk body.
 */
const addExpenseSchema = z
  .object({
    entry_type: z.enum(ENTRY_TYPE_VALUES),
    items: z.array(expenseLineSchema).min(1),
    date: z.string().min(1, "Date is required"),
    note: z.string().optional(),
  })
  .superRefine((values, context) => {
    values.items.forEach((line, index) =>
      requireCategory(values.entry_type, line.category_id, context, [
        "items",
        index,
        "category_id",
      ]),
    );
  });

export type AddExpenseFormValues = z.infer<typeof addExpenseSchema>;

/** Editing also reclassifies: entry_type and category_id go up with the edit. */
const editExpenseSchema = z
  .object({
    entry_type: z.enum(ENTRY_TYPE_VALUES),
    name: z.string().min(1, "Supply name is required"),
    category_id: z.string(),
    amount: z.string().min(1, "Amount is required"),
    date: z.string().min(1, "Date is required"),
    note: z.string().optional(),
  })
  .superRefine((values, context) =>
    requireCategory(values.entry_type, values.category_id, context, [
      "category_id",
    ]),
  );

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
  const queryClient = useQueryClient();
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
        // Same reasoning as create: invalidate by key prefix so every
        // mounted expenses-list instance refetches. This is called from the
        // list view (expenseId from useParams() isn't set there), so the
        // single-expense-by-id refetch this used to call was firing against
        // an undefined id.
        queryClient.invalidateQueries({
          queryKey: [queryKey.expenses.getAllExpenses],
        });
        if (closeModal) closeModal();
      },
    });

  const {
    data: ExpenseData,
    isLoading: ExpenseDataLoading,
    refetch: ExpensesDataRefetch,
  } = useFetchExpensesByIdQuery(expenseId, { enabled: !!expenseId });

  // console.log("ExpenseData----333", ExpenseData);

  const { mutate: editExpense, isPending: editExpenseLoading } =
    useEditExpenseMutation({
      // A reclassified entry moves between the Expense and Purchase cards, so
      // every list and the single read are dropped, not just this screen.
      // (Passing onSuccess replaces the mutation's own, toast included.)
      onSuccess: () => {
        showToast("Expense updated successfully", "success");
        queryClient.invalidateQueries({
          queryKey: [queryKey.expenses.getAllExpenses],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKey.expenses.getTransactions],
        });
        ExpensesDataRefetch();
      },
    });

  const { mutate: createExpenses, isPending: createExpensesLoading } =
    useCreateExpensesMutation({
      businessId: business_id, // Convert null to undefined
      onSuccess: (data) => {
        showToast(data.message, "success");
        // Multiple independent components each call useFetchExpensesQuery
        // with their own params (the overview card, the category grid, the
        // transactions table) — a single instance's refetch() only refreshes
        // that one. Invalidate by key prefix so every mounted instance
        // refetches, not just this hook's own.
        queryClient.invalidateQueries({
          queryKey: [queryKey.expenses.getAllExpenses],
        });
        if (closeModal) closeModal();
      },
    });
  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      entry_type: "EXPENSE",
      items: [{ name: "", category_id: "", amount: "" }],
      date: "",
      note: "",
    },
    mode: "onChange",
  });
  const editForm = useForm<editExpenseFormValues>({
    resolver: zodResolver(editExpenseSchema),
    defaultValues: {
      entry_type: "EXPENSE",
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
      const lines = values.items.map((line) => {
        const amount = Number(line.amount);
        if (isNaN(amount)) {
          throw new Error("Amount must be a valid number");
        }
        return {
          name: line.name.trim(),
          amount,
          // A transfer may go up without one.
          ...(line.category_id ? { category_id: line.category_id } : {}),
        };
      });

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

      // One line goes up flat; several go up as the bulk body, sharing the
      // type, date and note.
      const shared = {
        entry_type: values.entry_type,
        date: formattedDate,
        ...(values.note?.trim() ? { note: values.note.trim() } : {}),
      };
      const payload =
        lines.length === 1
          ? { ...shared, ...lines[0] }
          : { ...shared, items: lines };

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
        entry_type: string;
        name: string;
        category_id?: string;
        amount: number;
        date: string;
        note?: string;
      } = {
        entry_type: values.entry_type,
        name: values.name,
        amount: amount,
        date: formattedDate,
        ...(values.category_id ? { category_id: values.category_id } : {}),
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
        entry_type: entryTypeOf(ExpenseData?.data?.entry_type),
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
