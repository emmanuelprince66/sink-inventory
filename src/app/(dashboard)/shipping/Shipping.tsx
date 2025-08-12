"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Settings, Truck } from "lucide-react";
import { useState } from "react";
import CreateFreeShipping from "./CreateFreeShipping";
import CreateShippingMethod from "./CreateShippingMethod";
const Shipping = () => {
  const [currentView, setCurrentView] = useState("main");

  // Sample data for the table
  const shippingMethods = [
    {
      date: "2024-01-15",
      locationName: "United States",
      shippingDescription: "Standard shipping within US",
      shippingName: "US Standard",
    },
    {
      date: "2024-01-14",
      locationName: "Europe",
      shippingDescription: "Express shipping to European countries",
      shippingName: "EU Express",
    },
    {
      date: "2024-01-13",
      locationName: "Global",
      shippingDescription: "Free shipping on orders over $100",
      shippingName: "Free Shipping",
    },
  ];

  const MainView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shipping Method</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-200 border bg-transparent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            onClick={() => setCurrentView("free-shipping")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Free Shipping
          </Button>
          <Button
            onClick={() => setCurrentView("shipping-method")}
            variant="outline"
            className="flex items-center gap-2 border-gray-200 border"
          >
            <Truck className="h-4 w-4" />
            Create Shipping Method
          </Button>
        </div>
      </div>

      <Card className="w-ful p-4 border border-gray-200">
        <CardHeader>
          <CardTitle>Shipping Methods</CardTitle>
          <CardDescription>
            Manage your existing shipping methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Location Name</TableHead>
                <TableHead>Shipping Description</TableHead>
                <TableHead>Shipping Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingMethods.map((method, index) => (
                <TableRow key={index}>
                  <TableCell>{method.date}</TableCell>
                  <TableCell>{method.locationName}</TableCell>
                  <TableCell>{method.shippingDescription}</TableCell>
                  <TableCell>{method.shippingName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {currentView === "main" && <MainView />}
      {currentView === "free-shipping" && (
        <CreateFreeShipping onBack={() => setCurrentView("main")} />
      )}
      {currentView === "shipping-method" && (
        <CreateShippingMethod onBack={() => setCurrentView("main")} />
      )}
    </div>
  );
};

export default Shipping;
