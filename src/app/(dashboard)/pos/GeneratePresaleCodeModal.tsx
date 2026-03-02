"use client";
import { useCreatePresaleMutation } from "@/api/sales/use-presale";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { formatToNaira } from "@/utils/formatMoney";
import { Check, Copy, FileText, Trash2, X } from "lucide-react";
import { useState } from "react";

interface GeneratePresaleCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  clearCart: () => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
}

const GeneratePresaleCodeModal: React.FC<GeneratePresaleCodeModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  clearCart,
  removeFromCart,
  updateCartItemQuantity,
}) => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const { mutate: createPresale, isPending } = useCreatePresaleMutation({
    businessId: business_id,
    onSuccess: (data) => {
      // Extract code from response structure: data.data.message
      const code = data?.data?.message;

      if (code) {
        setGeneratedCode(code);
      } else {
        // Fallback to other possible locations
        const fallbackCode = data?.data?.code || data?.code || data?.message;
        if (fallbackCode) {
          setGeneratedCode(fallbackCode);
        } else {
          showToast("Presale created but no code returned", "warning");
          console.error("Unexpected response structure:", data);
        }
      }
    },
    onError: (error) => {
      console.error("Presale creation error:", error);
    },
  });

  const handleGenerateCode = () => {
    if (!business_id) {
      showToast("Business ID is required", "error");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }

    const payload = {
      products: cartItems.map((item) => ({
        id: item.id,
        quantity: item.cartQuantity || 1,
      })),
    };

    // Call mutation with correct structure
    createPresale({
      businessId: business_id,
      payload: payload,
    });
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        showToast("Code copied to clipboard", "success");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        try {
          const textArea = document.createElement("textarea");
          textArea.value = generatedCode;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setCopied(true);
          showToast("Code copied to clipboard", "success");
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
          showToast("Failed to copy code. Please copy manually.", "error");
        }
      }
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    showToast(`${itemName} removed from cart`, "info");
  };

  const handleClearCart = () => {
    clearCart();
    showToast("Cart cleared", "info");
  };

  const handleClose = () => {
    if (generatedCode) {
      clearCart();
      setGeneratedCode(null);
      setCopied(false);
    }
    onClose();
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = (item.cartQuantity || 1) + change;
    if (newQuantity < 1) {
      handleRemoveItem(itemId, item.name);
      return;
    }

    const maxQuantity = item.quantity ?? 999;
    if (newQuantity > maxQuantity) {
      showToast(`Maximum available quantity is ${maxQuantity}`, "warning");
      return;
    }

    updateCartItemQuantity(itemId, newQuantity);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Presale Code"
    >
      <div className="space-y-4">
        {!generatedCode ? (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Cart Summary
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {cartItems.length} product(s) will be included in the
                    presale
                  </p>
                </div>
                {cartItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    className="border-red-500 text-red-500 hover:text-red-600  hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            <div className="border-gray-100 shadow-sm border rounded-md max-h-[300px] overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">No items in cart</p>
                  <p className="text-xs mt-1">
                    Add products to create a presale
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="text-gray-600 hover:text-gray-800 text-xs font-bold w-5 h-5 flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="text-xs font-medium min-w-[20px] text-center">
                              {item.cartQuantity || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="text-gray-600 hover:text-gray-800 text-xs font-bold w-5 h-5 flex items-center justify-center"
                              disabled={
                                (item.cartQuantity || 1) >=
                                (item.quantity ?? 999)
                              }
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatToNaira(
                              item.selling_price || item.amount || 0,
                            )}
                          </span>
                        </div>
                        {item.sku && (
                          <p className="text-xs text-gray-400 mt-1">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerateCode}
              disabled={isPending || cartItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Generate Code
            </Button>
          </>
        ) : (
          <>
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-green-900 mb-1">
                  Presale Code Generated
                </h3>
                <p className="text-sm text-green-700">
                  Share this code with an attendant to complete the sale
                </p>
              </div>

              <div className="p-4 bg-white border border-green-300 rounded-md">
                <p className="text-xs text-gray-500 mb-2">Presale Code</p>
                <p className="text-2xl font-bold text-green-800 tracking-wider break-all">
                  {generatedCode}
                </p>
              </div>

              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default GeneratePresaleCodeModal;
