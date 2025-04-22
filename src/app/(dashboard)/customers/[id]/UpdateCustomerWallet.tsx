import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const UpdateCustomerWallet = () => {
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <div className="border bg-white border-green-300 rounded w-full p-4 flex flex-col justify-between items-center">
        <div className="flex justify-between items-start w-full">
          <p className="text-primary-black-100 font-bold">Deposit</p>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>Open</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-primary-green-200 border-none">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer hover:bg-white">
                    Deposit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-white">
                    Withdrawal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <span className="flex gap-2 items-center w-full">
          <p>Balance : </p>
          <p className="text-bold text-primary-green-300">30.000</p>
        </span>
      </div>
    </div>
  );
};

export default UpdateCustomerWallet;
