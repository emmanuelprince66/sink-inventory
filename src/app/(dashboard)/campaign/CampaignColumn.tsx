import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { CustomModal } from "@/components/app/CustomModal";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import DeleteCampaign from "./DeleteCampaign";
import EditCampaign from "./EditCampaign";
export const columns: ColumnDef<any>[] = [
  //   {
  //     accessorKey: "logo",
  //     header: "",
  //     cell: ({ row }) => {
  //       const campaign = row.original;
  //       return (
  //         <div className="relative h-10 w-10 rounded-md overflow-hidden">
  //           <Image
  //             src={campaign.profile_pic}
  //             alt={`${campaign.name} logo`}
  //             fill
  //             className="object-cover"
  //           />
  //         </div>
  //       );
  //     },
  //   },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{campaign?.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{campaign?.title}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{campaign.channel}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "user_count",
    header: "Total User",
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{campaign?.user_counts}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const campaign = row.original;
      const isNegative = campaign.wallet < 0;

      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{campaign?.message}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "",
    header: "Action",
    cell: ({ row }) => {
      const router = useRouter();
      const [deleteCampaignModal, setDeleteCampaignModal] = useState(false);
      const [editCampaignModal, setEditCampaignModal] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border border-gray-200 shadow-lg min-w-[180px]"
            >
              <DropdownMenuItem
                onClick={() => setEditCampaignModal(true)}
                className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteCampaignModal(true)}
                className="cursor-pointer px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <span className=" text-red-500">Delete campaign</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CustomModal
            isOpen={editCampaignModal}
            onClose={() => setEditCampaignModal(false)}
            trigger={false}
            title="Edit Campaign"
          >
            <EditCampaign
              editData={row.original}
              closeModal={() => setEditCampaignModal(false)}
            />
          </CustomModal>
          <CustomModal
            isOpen={deleteCampaignModal}
            onClose={() => setDeleteCampaignModal(false)}
            trigger={false}
            title="Delete Campaign"
          >
            <DeleteCampaign
              id={row.original?.id}
              closeModal={() => setDeleteCampaignModal(false)}
            />
          </CustomModal>
        </>
      );
    },
  },
];
