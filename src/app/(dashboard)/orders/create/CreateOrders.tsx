"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useOrdersHook } from "@/hooks/useOrdersHook";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import CustomerDrawer from "../../pos/CustomersDrawer";
import ProductDrawer from "./ProductDrawer";

const CreateOrders = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isSelectProductDrawerOpen, setIsSelectProductDrawerOpen] =
    useState(false);

  const { InventoryData, InventoryDataLoading } = useOrdersHook({
    page,
    searchInput,
  });

  // Dummy data
  const customers = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Acme Corporation" },
    { id: "4", name: "XYZ Industries" },
  ];

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
  ];

  const salesChannels = [
    { id: "online", name: "Online Store" },
    { id: "retail", name: "Retail Store" },
    { id: "wholesale", name: "Wholesale" },
    { id: "phone", name: "Phone Order" },
  ];

  const paymentMethods = [
    { id: "credit", name: "Credit Card" },
    { id: "bank", name: "Bank Transfer" },
    { id: "paypal", name: "PayPal" },
    { id: "cash", name: "Cash" },
  ];

  // State
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedSalesChannel, setSelectedSalesChannel] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      customer: selectedCustomer,
      products: selectedProducts,
      currency: selectedCurrency,
      salesChannel: selectedSalesChannel,
      orderDate,
      paymentStatus,
      paymentMethod: selectedPaymentMethod,
      notes,
    });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => {
      return sum + product.selling_price * (product.quantity || 1);
    }, 0);
  };

  return (
    <div className="space-y-6 mx-auto max-w-4xl">
      <h2 className="text-xl font-semibold cursor-pointer">Back</h2>
      <h2 className="text-xl font-semibold">Order Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Customer Dropdown */}
          <div className="space-y-2 w-full">
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {customers.map((customer) => (
                  <SelectItem
                    className="w-full"
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Dropdown */}
          <div className="space-y-2 w-full">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sales Channel Dropdown */}
          <div className="space-y-2 w-full">
            <Label htmlFor="salesChannel">Sales Channel</Label>
            <Select
              value={selectedSalesChannel}
              onValueChange={setSelectedSalesChannel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a sales channel" />
              </SelectTrigger>
              <SelectContent>
                {salesChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Date */}
          <div className="space-y-2 w-full">
            <Label htmlFor="orderDate">Order Date</Label>
            <Input
              type="date"
              id="orderDate"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-4 w-full">
          <div className="flex w-full justify-between items-center">
            <Label>Customer</Label>

            {customer?.name && (
              <Button
                className="border border-red-500 hover:bg-red-50"
                variant="outline"
                size="sm"
                onClick={() => setCustomer("")}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
          <div
            className="hover:border-green-300 cursor-pointer rounded-md border border-gray-200 bg-white p-4"
            onClick={() => setIsCustomerDrawerOpen(true)}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs">
                {customer ? customer.name : "Add Customer"}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4 w-full">
          <Label>Products</Label>
          <div
            className="hover:border-green-300 cursor-pointer rounded-md border border-gray-200 bg-white p-4"
            onClick={() => setIsSelectProductDrawerOpen(true)}
          >
            <p className="text-sm text-gray-600">
              {selectedProducts.length > 0
                ? `${selectedProducts.length} product(s) selected`
                : "Click to select products"}
            </p>
          </div>

          {selectedProducts.length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-1 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-500">
                        ₦{product.selling_price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-20"
                      onChange={(e) => {
                        const updatedProducts = selectedProducts.map((p) =>
                          p.id === product.id
                            ? { ...p, quantity: parseInt(e.target.value) || 1 }
                            : p
                        );
                        setSelectedProducts(updatedProducts);
                      }}
                    />
                    <Button
                      className="border border-red-500 hover:bg-red-50"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="p-4 border-t font-medium text-right">
                Total: ₦{calculateTotal().toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Payment Status Tabs */}
        <div className="space-y-4 w-full">
          <Label>Payment Status</Label>
          <Tabs
            value={paymentStatus}
            onValueChange={setPaymentStatus}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="partially">Partially Paid</TabsTrigger>
            </TabsList>

            <TabsContent value="paid" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2 w-full">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="partially" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unpaid" className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" className="w-[200px] h-12">
            Create Order
          </Button>
        </div>
      </form>

      <ProductDrawer
        open={isSelectProductDrawerOpen}
        page={page}
        setPage={setPage}
        onOpenChange={setIsSelectProductDrawerOpen}
        onProductSelect={(products) => {
          setSelectedProducts(products);
          setIsSelectProductDrawerOpen(false);
        }}
        products={InventoryData}
        setSearchInput={setSearchInput}
        isLoading={InventoryDataLoading}
      />

      {/* Drawers */}
      <CustomerDrawer
        open={isCustomerDrawerOpen}
        onOpenChange={setIsCustomerDrawerOpen}
        onCustomerSelect={(selectedCustomer: any) => {
          setCustomer(selectedCustomer);
        }}
      />
    </div>
  );
};

export default CreateOrders;
