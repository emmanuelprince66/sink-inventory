// components/ui/custom-card.tsx
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ReactNode } from "react";

interface CustomCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  footerContent?: ReactNode;
  className?: string;
  bgColor?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const CustomCard = ({
  children,
  title,
  description,
  footerContent,
  className,
  bgColor = "bg-white",
  headerClassName,
  contentClassName,
  footerClassName,
}: CustomCardProps) => {
  return (
    <Card className={cn("w-full p-0", bgColor, className)}>
      {(title || description) && (
        <CardHeader className={cn(headerClassName)}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("p-3", contentClassName)}>
        {children}
      </CardContent>
      {footerContent && (
        <CardFooter className={cn(footerClassName)}>{footerContent}</CardFooter>
      )}
    </Card>
  );
};
