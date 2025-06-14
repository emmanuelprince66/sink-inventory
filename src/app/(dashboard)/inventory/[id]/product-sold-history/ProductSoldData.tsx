import NoProductSold from "./NoProductSold";
import ProductSoldHistoryTable from "./ProductSoldHistoryTable";

const ProductSoldData = ({
  productSoldData,
  productSoldLoading,
}: {
  productSoldData: any;
  productSoldLoading: boolean;
}) => {
  return (
    <>
      <div className="w-full mt-3">
        {productSoldData?.length > 0 && !productSoldLoading ? (
          <ProductSoldHistoryTable response={[]} loading={false} />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center mt-8">
            <NoProductSold />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductSoldData;
