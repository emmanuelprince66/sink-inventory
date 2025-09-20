interface DiscountProductProps {
  SalesData: any;
  SalesLoading: boolean;
  closeDiscountSalesModal: () => void;
}
const DiscountProduct = ({
  SalesData,
  closeDiscountSalesModal,
  SalesLoading,
}: DiscountProductProps) => {
  console.log("SalesData", SalesData);
  return <div>DiscountProduct</div>;
};

export default DiscountProduct;
