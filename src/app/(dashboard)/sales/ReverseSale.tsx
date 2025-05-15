"use client";
const ReverseSale = ({
  closeReverseModal,
  product,
}: {
  closeReverseModal: () => void;
  product: any;
}) => {
  //   const { handleReverseSale } = useSalesHook();

  console.log("product", product);
  return (
    <>
      <div className="w-full flex-col flex items-center justify-center gap-3">
        <p className="text-sm">Are you sure you want to reverse this sale?</p>
        <div className="flex gap-3 items-center">
          <button
            className="bg-red-500 cursor-pointer text-white py-2 px-4 rounded-md"
            onClick={closeReverseModal}
          >
            Cancel
          </button>
          <button className="bg-primary-green-300 text-white cursor-pointer py-2 px-4 rounded-md">
            Confirm
          </button>
        </div>
      </div>
    </>
  );
};

export default ReverseSale;
