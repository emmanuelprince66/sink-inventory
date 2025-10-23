const NoOrders = () => {
  return (
    <div className="flex flex-col  items-center h-[60vh] justify-center w-full gap-4 text-center ">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[rgb(30,30,30)]">
          No Orders matched your search.
        </h2>
        <p className="text-gray-400">
          Try different filters or adjust your search terms.
        </p>
      </div>
    </div>
  );
};

export default NoOrders;
