// components/ui/modal.tsx
import { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
}

export function CustomModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  trigger,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {trigger && (
        <DialogTrigger asChild>
          <div className="cursor-pointer">{trigger}</div>
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-w-[90vw] sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] md:max-h-[95vh]  overflow-y-auto bg-white z-50 border-0 rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-gray-600 sm:text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4 w-full">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
