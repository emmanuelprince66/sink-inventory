import { Ellipsis, Pencil, Trash2 } from "lucide-react";

import Image from "next/image";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BusinessType } from "./types/types";

const BusinessCard = ({ business }: { business: BusinessType }) => {
  return (
    <Card className="my-4 w-full bg-white hover:bg-primary-green-500 md:w-[80%] cursor-pointer py-2 mx-auto border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader className=" ">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3">
            {business.logo && (
              <div className="relative h-10 w-10 rounded-md overflow-hidden">
                <Image
                  src={business.logo}
                  alt={`${business.name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <CardTitle className="text-base  font-medium">
                {business.name}
              </CardTitle>
              <CardDescription className=" text-xs text-gray-500 ">
                {business.type}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <Ellipsis className="h-5 w-5 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-primary-green-500 border-gray-200"
            >
              <DropdownMenuItem className="cursor-pointer hover:bg-white">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-white text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* <CardContent className="bg-green-200">
        <span className="text-xs text-gray-500">
          {business.city}, {business.country}
        </span>
      </CardContent> */}
    </Card>
  );
};

export default BusinessCard;
