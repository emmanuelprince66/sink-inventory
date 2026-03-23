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
import { Calendar, Filter, Search } from "lucide-react";
import { useState } from "react";

// Dummy data for restock history
const dummyRestockData = [
  {
    id: 1,
    productName: "Paracetamol 500mg",
    sku: "PAR-500-001",
    restockUnit: 500,
    date: "2024-03-20",
    user: "John Doe",
    remark: "Regular restock from main supplier",
  },
  {
    id: 2,
    productName: "Ibuprofen 400mg",
    sku: "IBU-400-002",
    restockUnit: 300,
    date: "2024-03-19",
    user: "Jane Smith",
    remark: "Emergency restock due to high demand",
  },
  {
    id: 3,
    productName: "Amoxicillin 250mg",
    sku: "AMO-250-003",
    restockUnit: 200,
    date: "2024-03-18",
    user: "Mike Johnson",
    remark: "Quarterly stock replenishment",
  },
  {
    id: 4,
    productName: "Vitamin C 1000mg",
    sku: "VIT-C-1000-004",
    restockUnit: 150,
    date: "2024-03-17",
    user: "Sarah Williams",
    remark: "New supplier trial order",
  },
  {
    id: 5,
    productName: "Aspirin 75mg",
    sku: "ASP-075-005",
    restockUnit: 400,
    date: "2024-03-16",
    user: "John Doe",
    remark: "Regular monthly restock",
  },
  {
    id: 6,
    productName: "Metformin 500mg",
    sku: "MET-500-006",
    restockUnit: 350,
    date: "2024-03-15",
    user: "Jane Smith",
    remark: "Bulk order for seasonal demand",
  },
  {
    id: 7,
    productName: "Omeprazole 20mg",
    sku: "OME-020-007",
    restockUnit: 250,
    date: "2024-03-14",
    user: "Mike Johnson",
    remark: "Restocked after promotion period",
  },
  {
    id: 8,
    productName: "Cetirizine 10mg",
    sku: "CET-010-008",
    restockUnit: 180,
    date: "2024-03-13",
    user: "Sarah Williams",
    remark: "Allergy season preparation",
  },
];

const RestockHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [filteredData, setFilteredData] = useState(dummyRestockData);

  // Extract unique users for filter
  const uniqueUsers = Array.from(
    new Set(dummyRestockData.map((item) => item.user)),
  );

  // Handle search and filter
  const handleFilter = () => {
    let filtered = dummyRestockData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.remark.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((item) => item.date === dateFilter);
    }

    // User filter
    if (userFilter) {
      filtered = filtered.filter((item) => item.user === userFilter);
    }

    setFilteredData(filtered);
  };

  // Reset filters
  const handleReset = () => {
    setSearchQuery("");
    setDateFilter("");
    setUserFilter("");
    setFilteredData(dummyRestockData);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restock History</h1>
        <p className="text-gray-500 mt-1">
          Track all inventory restock activities and records
        </p>
      </div>

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
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search product, SKU, or remark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1">
                Apply
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
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
            Restock Records ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Restock Unit</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No restock records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.restockUnit} units
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {item.date}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-green-100 flex items-center justify-center text-primary-green-700 font-semibold text-sm">
                            {item.user.charAt(0)}
                          </div>
                          <span>{item.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">
                        {item.remark}
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

export default RestockHistory;
