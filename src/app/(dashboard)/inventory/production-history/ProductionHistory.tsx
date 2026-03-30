"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { Calendar, Filter, Search, TrendingUp, PackageCheck, PackageMinus, Banknote } from "lucide-react";
import { useState, useMemo } from "react";

// Dummy data for production history
const dummyProductionData = [
  {
    id: 1,
    productName: "Paracetamol Syrup 120ml",
    unitMoved: 50,
    unitReceived: 50,
    unitPrice: 4.5,
    date: "2024-03-20T14:30:00",
    movedBy: "John Doe",
    receivedBy: "Sarah Williams",
    status: "received",
  },
  {
    id: 2,
    productName: "Cough Syrup 100ml",
    unitMoved: 30,
    unitReceived: 30,
    unitPrice: 6.75,
    date: "2024-03-19T10:15:00",
    movedBy: "Jane Smith",
    receivedBy: "Mike Johnson",
    status: "received",
  },
  {
    id: 3,
    productName: "Vitamin Mix Tablets",
    unitMoved: 100,
    unitReceived: 0,
    unitPrice: 3.2,
    date: "2024-03-18T16:45:00",
    movedBy: "Mike Johnson",
    receivedBy: "-",
    status: "moved",
  },
  {
    id: 4,
    productName: "Antiseptic Solution 500ml",
    unitMoved: 75,
    unitReceived: 75,
    unitPrice: 9.0,
    date: "2024-03-17T09:20:00",
    movedBy: "Sarah Williams",
    receivedBy: "John Doe",
    status: "received",
  },
  {
    id: 5,
    productName: "Hand Sanitizer 250ml",
    unitMoved: 200,
    unitReceived: 0,
    unitPrice: 2.8,
    date: "2024-03-16T13:10:00",
    movedBy: "John Doe",
    receivedBy: "-",
    status: "moved",
  },
  {
    id: 6,
    productName: "Pain Relief Gel 50g",
    unitMoved: 60,
    unitReceived: 60,
    unitPrice: 7.5,
    date: "2024-03-15T11:30:00",
    movedBy: "Jane Smith",
    receivedBy: "Sarah Williams",
    status: "received",
  },
  {
    id: 7,
    productName: "Eye Drops 10ml",
    unitMoved: 40,
    unitReceived: 40,
    unitPrice: 5.25,
    date: "2024-03-14T15:00:00",
    movedBy: "Mike Johnson",
    receivedBy: "Jane Smith",
    status: "received",
  },
  {
    id: 8,
    productName: "Antibiotic Ointment 15g",
    unitMoved: 85,
    unitReceived: 0,
    unitPrice: 11.0,
    date: "2024-03-13T08:45:00",
    movedBy: "Sarah Williams",
    receivedBy: "-",
    status: "moved",
  },
];

const ProductionHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredData, setFilteredData] = useState(dummyProductionData);

  const { user } = useUserRole();
  const userRole = user?.role || "INVENTORY-MANAGER";
  const isProductionManager = false;

  // Compute worth stats from filtered data
  const worthStats = useMemo(() => {
    const totalWorth = filteredData.reduce(
      (sum, item) => sum + item.unitMoved * item.unitPrice,
      0
    );
    const receivedWorth = filteredData
      .filter((item) => item.status === "received")
      .reduce((sum, item) => sum + item.unitReceived * item.unitPrice, 0);
    const pendingWorth = filteredData
      .filter((item) => item.status === "moved")
      .reduce((sum, item) => sum + item.unitMoved * item.unitPrice, 0);

    return { totalWorth, receivedWorth, pendingWorth };
  }, [filteredData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  const handleFilter = () => {
    let filtered = dummyProductionData;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.movedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.receivedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((item) => item.date.startsWith(dateFilter));
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchQuery("");
    setDateFilter("");
    setStatusFilter("");
    setFilteredData(dummyProductionData);
  };

  const handleReceive = (id: number) => {
    setFilteredData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "received",
              unitReceived: item.unitMoved,
              receivedBy: user?.name || "Current User",
            }
          : item
      )
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Production History</h1>
        <p className="text-gray-500 mt-1">
          {isProductionManager
            ? "Manage and receive production units"
            : "Track production movement and status"}
        </p>
      </div>

      {/* Worth Summary Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-1 rounded-xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-400" />
              Production Worth Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Worth */}
              <div className="bg-white/5 rounded-lg px-4 py-4 border border-white/10 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-emerald-500/20">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total Moved
                  </span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {formatCurrency(worthStats.totalWorth)}
                </span>
                <span className="text-xs text-slate-500">
                  {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Received Worth */}
              <div className="bg-white/5 rounded-lg px-4 py-4 border border-white/10 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-green-500/20">
                    <PackageCheck className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Received
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-400 tracking-tight">
                  {formatCurrency(worthStats.receivedWorth)}
                </span>
                <span className="text-xs text-slate-500">
                  {filteredData.filter((d) => d.status === "received").length} completed
                </span>
              </div>

              {/* Pending Worth */}
              <div className="bg-white/5 rounded-lg px-4 py-4 border border-white/10 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full" />
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-amber-500/20">
                    <PackageMinus className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Pending
                  </span>
                </div>
                <span className="text-2xl font-bold text-amber-400 tracking-tight">
                  {formatCurrency(worthStats.pendingWorth)}
                </span>
                <span className="text-xs text-slate-500">
                  {filteredData.filter((d) => d.status === "moved").length} awaiting receipt
                </span>
              </div>
            </div>

            {/* Progress bar showing received vs total */}
            {worthStats.totalWorth > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Receipt progress</span>
                  <span>
                    {Math.round((worthStats.receivedWorth / worthStats.totalWorth) * 100)}% received
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(worthStats.receivedWorth / worthStats.totalWorth) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search product or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            {!isProductionManager && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="moved">Moved</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1">
                Apply
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Production Records ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold">
                    {isProductionManager ? "Unit Received" : "Unit Moved"}
                  </TableHead>
                  <TableHead className="font-semibold">Unit Price</TableHead>
                  <TableHead className="font-semibold">Total Worth</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Moved By</TableHead>
                  <TableHead className="font-semibold">Received By</TableHead>
                  {isProductionManager ? (
                    <TableHead className="font-semibold">Action</TableHead>
                  ) : (
                    <TableHead className="font-semibold">Status</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No production records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {isProductionManager
                            ? item.unitReceived || item.unitMoved
                            : item.unitMoved}{" "}
                          units
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(item.unitMoved * item.unitPrice)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatDateTime(item.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-green-100 flex items-center justify-center text-primary-green-700 font-semibold text-sm">
                            {item.movedBy.charAt(0)}
                          </div>
                          <span className="text-sm">{item.movedBy}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.receivedBy !== "-" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                              {item.receivedBy.charAt(0)}
                            </div>
                            <span className="text-sm">{item.receivedBy}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isProductionManager ? (
                          item.status === "moved" ? (
                            <Button
                              size="sm"
                              onClick={() => handleReceive(item.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Receive
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Received
                            </span>
                          )
                        ) : (
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                              item.status === "received"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {item.status === "received" ? "Received" : "Moved"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionHistory;