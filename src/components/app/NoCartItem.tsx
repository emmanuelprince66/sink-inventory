"use client";

const NoCartItem = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-green-50 rounded-lg border border-green-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <h3 className="text-xl font-semibold text-green-800">No items in cart</h3>
      <p className="text-green-600 max-w-md">
        Add some products to your cart and they'll appear here
      </p>
      <div className="mt-4 h-px w-24 bg-green-200"></div>
    </div>
  );
};

export default NoCartItem;
