"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface CreateFreeShippingProps {
  onBack: () => void;
}

const CreateFreeShipping = ({ onBack }: CreateFreeShippingProps) => {
  const [cartItemsToggle, setCartItemsToggle] = useState(false);
  const [cartValueToggle, setCartValueToggle] = useState(false);
  const [currencyToggle, setCurrencyToggle] = useState(false);

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log("Creating free shipping...");
    onBack();
  };

  return (
    <Card className="w-full max-w-6xl mx-auto border border-gray-200 p-4">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <CardTitle>Enter Free Shipping Details</CardTitle>
        <CardDescription>
          Configure your free shipping conditions and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location-name">Location Name</Label>
          <Input id="location-name" placeholder="Enter location name" />
          <p className="text-sm text-muted-foreground">
            Free shipping condition for description
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Based on minimum number of cart items</Label>
              <p className="text-sm text-muted-foreground">
                Set free shipping based upon cart items
              </p>
            </div>
            <Switch
              checked={cartItemsToggle}
              onCheckedChange={setCartItemsToggle}
            />
          </div>

          {cartItemsToggle && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="min-cart-items">
                Set Minimum Cart Items (Optional)
              </Label>
              <Input
                id="min-cart-items"
                type="number"
                placeholder="Enter minimum items"
              />
              <p className="text-sm text-muted-foreground">
                Set the minimum number of items a customer needs to purchase to
                get free shipping.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Based on minimum number of cart value</Label>
              <p className="text-sm text-muted-foreground">
                Set free shipping based upon cart value
              </p>
            </div>
            <Switch
              checked={cartValueToggle}
              onCheckedChange={setCartValueToggle}
            />
          </div>

          {cartValueToggle && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="min-cart-amount">
                Set Minimum Cart amount (Optional)
              </Label>
              <Input
                id="min-cart-amount"
                type="number"
                placeholder="Enter minimum amount"
              />
              <p className="text-sm text-muted-foreground">
                Set the minimum amount customers need to spend to get free
                shipping.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Based on Currency</Label>
              <p className="text-sm text-muted-foreground">
                Set free shipping based on the currency your customers are
                buying with
              </p>
            </div>
            <Switch
              checked={currencyToggle}
              onCheckedChange={setCurrencyToggle}
            />
          </div>

          {currencyToggle && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="select-currencies">
                Select Currencies (Optional)
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="gbp">GBP - British Pound</SelectItem>
                  <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select currencies for free shipping
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping-description">
            Shipping Description (Optional)
          </Label>
          <Textarea
            id="shipping-description"
            placeholder="Enter shipping description"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            Create Free Shipping
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateFreeShipping;
