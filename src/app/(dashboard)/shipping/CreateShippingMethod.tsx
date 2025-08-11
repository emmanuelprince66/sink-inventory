"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface CreateShippingMethodProps {
  onBack: () => void;
}

const CreateShippingMethod = ({ onBack }: CreateShippingMethodProps) => {
  const [visibleOnCheckout, setVisibleOnCheckout] = useState(false);

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log("Creating shipping method...");
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
        <CardTitle>Create Shipping Method</CardTitle>
        <CardDescription>
          Set up a new shipping method for your store
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location-name-method">Location Name *</Label>
          <Input
            id="location-name-method"
            placeholder="Enter location name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping-fee">Shipping Fee (Optional)</Label>
          <Input id="shipping-fee" type="number" placeholder="0.00" />
          <p className="text-sm text-muted-foreground">
            Leave blank to make shipping fee "FREE"
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping-description-method">
            Shipping Description (Optional)
          </Label>
          <Textarea
            id="shipping-description-method"
            placeholder="Enter shipping description"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="select-locations">Select Locations (Optional)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="eu">European Union</SelectItem>
              <SelectItem value="global">Global</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="visible-checkout"
            checked={visibleOnCheckout}
            onChange={() => setVisibleOnCheckout(true)}
          />
          <Label htmlFor="visible-checkout">
            Make shipping method visible on web checkout
          </Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            Create Shipping Method
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

export default CreateShippingMethod;
