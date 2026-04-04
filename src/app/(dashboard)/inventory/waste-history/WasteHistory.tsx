"use client";

import { CustomTable } from "@/components/app/CutomTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PRODUCT_HISTORY_TABS,
  useProductHistoryHook,
} from "@/hooks/useProductHistoryHook";
import { cn } from "@/lib/utils";
import { Package, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { createProductHistoryColumns } from "./ProductHistoryColumns";
import { ProductHistorySkeleton } from "./ProductHistorySkeleton";

const tabIcons = {
  WASTE: Trash2,
  RETURN: RotateCcw,
  DAMAGED: AlertTriangle,
};

const ProductHistory = () => {
  const {
    activeTab,
    setActiveTab,
    results,
    total,
    totalPages,
    isLoading,
    isFetching,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useProductHistoryHook();

  const columns = createProductHistoryColumns();

  if (isLoading) {
    return <ProductHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Product History
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                Track waste, returns, and damaged product records
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
                <Package className="h-4 w-4" />
                <span>{total} records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {PRODUCT_HISTORY_TABS.map((tab) => {
            const Icon = tabIcons[tab.value];
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  activeTab === tab.value
                    ? "bg-green-600 text-white shadow-sm shadow-green-500/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table Card */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  {PRODUCT_HISTORY_TABS.find((t) => t.value === activeTab)
                    ?.label || "Records"}
                </CardTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {total}
                </span>
              </div>

              {isFetching && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Updating...
                </div>
              )}
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <CustomTable
              columns={columns}
              data={results}
              loading={isFetching}
              noDataText={
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    No records found
                  </h3>
                  <p className="text-slate-500">
                    No{" "}
                    {activeTab.toLowerCase()} history records available
                  </p>
                </div>
              }
              pagination={{
                currentPage: page,
                totalPages,
                pageSize,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductHistory;
