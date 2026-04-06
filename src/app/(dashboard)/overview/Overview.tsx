"use client";

import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  ChevronRight,
  CircleDollarSign,
  Clock,
  MessageCircleCode,
  Package,
  PackageOpen,
  PackageX,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Users2,
  Zap,
} from "lucide-react";

import { CustomModal } from "@/components/app/CustomModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOverviewHook } from "@/hooks/useOverviewHook";
import { useUserRole } from "@/lib/store/user-store";
import { useState } from "react";
import ProductsInfo from "./ProductsInfo";
import { QuickActionCard } from "./quick-action-card";
import { StockPerformanceChart } from "./stock-performance-chart";
import { StockStatusChart } from "./stock-status-chart";
import { TopStockedItemsChart } from "./top-stocked-items-chart";

const quickActions = [
  {
    icon: <Package className="h-5 w-5" />,
    title: "Sales",
    description: "View and manage sales ",
    href: "/sales/",
  },
  {
    icon: <BadgeDollarSign className="h-5 w-5" />,
    title: "Expenses",
    description: "View and manage expenses",
    href: "/expenses",
  },
  {
    icon: <Users2 className="h-5 w-5" />,
    title: "Customers",
    description: "View and manage customers",
    href: "/customers",
  },
  {
    icon: <MessageCircleCode className="h-5 w-5" />,
    title: "Campaign",
    description: "View and manage campaigns",
    href: "/campaign",
  },
];

// Loading skeleton for metrics cards
const MetricsCardSkeleton = () => (
  <Card className="border-gray-200 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <Skeleton className="h-4 w-20 bg-[#eef4ef]" />
      <Skeleton className="h-4 w-4 bg-[#eef4ef]" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-24 mb-2 bg-[#eef4ef]" />
      <Skeleton className="h-3 w-32 bg-[#eef4ef]" />
    </CardContent>
  </Card>
);

// Loading skeleton for charts
const ChartSkeleton = () => (
  <div className="h-[300px] flex flex-col">
    <Skeleton className="h-4 w-32 mb-4 mx-auto bg-[#eef4ef]" />
    <div className="flex-1 space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton className="h-6 w-20 bg-[#eef4ef]" />
          <Skeleton className="h-6 flex-1 bg-[#eef4ef]" />
        </div>
      ))}
    </div>
  </div>
);

// Component for product status cards (Fast Moving/Expiring Soon)
interface ProductStatusCardProps {
  title: string;
  description: string;
  items: Array<{ name: string; value: number }>;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  bgColor?: string;
  type?: string;
  loading?: boolean;
}

export default function Overview() {
  const { SalesDashboardData, SalesDashboardLoading } = useOverviewHook();
  const [productInfo, setProductInfo] = useState(Array<any>([]));
  const [selectedType, setSelectedType] = useState("");
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const closeInfoModal = () => setOpenInfoModal(false);

  const { role } = useUserRole();

  // Calculate metrics from real data
  const getMetricsData = () => {
    if (!SalesDashboardData?.data) return [];

    const data = SalesDashboardData.data;

    return [
      {
        title: "Total Sales",
        value: `${data?.total_purchases?.toLocaleString()}`,
        change: "+0.0%",
        icon: CircleDollarSign,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/30",
        changeColor: "text-green-500",
      },
      // {
      //   title: "Current Balance",
      //   value: `${data?.current_balance?.toLocaleString()}`,
      //   change: "+0.0%",
      //   icon: Wallet,
      //   iconColor: "text-pink-500",
      //   bgColor: "bg-pink-50 dark:bg-pink-900/30",
      //   changeColor: "text-green-500",
      // },
      {
        title: "Today's Sales",
        value: data?.total_sales_today.toString(),
        change: "+0.0%",
        icon: ShoppingCart,
        iconColor: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-900/30",
        changeColor: "text-green-500",
      },
      {
        title: "New Customers",
        value: data.new_customer?.toString() || "0",
        change: "+0.0%",
        icon: Users,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/30",
        changeColor: "text-green-500",
      },
      {
        title: "Returning Customers",
        value: data.returning_customer?.toString() || "0",
        change: "+0.0%",
        icon: Users,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/30",
        changeColor: "text-green-500",
      },
    ];
  };

  const ProductStatusCard = ({
    title,
    description,
    items,
    icon: Icon = AlertTriangle,
    iconColor = "text-amber-500",
    bgColor = "bg-gray-50",
    type = "",
    loading = false,
  }: ProductStatusCardProps) => {
    return (
      <Card className={`border-gray-200 shadow-sm ${bgColor} p-0`}>
        <div className="p-1 ">
          <div className="flex justify-between p-2 items-center">
            <p className="text-sm font-medium">{title}</p>
          </div>
        </div>
        <div className="pt-0 p-0">
          {loading ? (
            <div className="h-[60px] px-2 flex items-center flex-col gap-1 justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center flex-col px-2 gap-1 w-full"
                >
                  <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No items found
            </div>
          ) : (
            <>
              <div className="flex items-start flex-col m-2 p-2 justify-between  rounded-lg bg-white shadow-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3 w-3 ${iconColor}`} />
                  <span className="text-sm font-medium line-clamp-1 pt-[2px]">
                    {items[0].name}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold p-2">
                {items[0].value}{" "}
                <span className="text-[10px] text-gray-500 ">Units </span>
              </span>

              <div className="w-full mt-9 p-2">
                <button
                  onClick={() => handleViewMore(type)}
                  className="cursor-pointer border border-gray-200 hover:border-green-500 font-medium text-xs flex items-center gap-1  transition-colors p-1.5 rounded-md "
                >
                  <p className="text-[10px] pt-[1px]">View More</p>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  const handleViewMore = (type: string) => {
    console.log("type", type);
    switch (type) {
      case "top":
        setProductInfo(SalesDashboardData?.data?.top_selling_products);

        break;
      case "fast":
        setProductInfo(SalesDashboardData?.data?.fast_moving_product);
        break;
      case "expired":
        setProductInfo(SalesDashboardData?.data?.expired_product);
        break;
      case "soon":
        setProductInfo(SalesDashboardData?.data?.expiring_soon);
        break;
      case "l":
        setProductInfo(SalesDashboardData?.data?.low_stock);
        break;
      case "o":
        setProductInfo(SalesDashboardData?.data?.out_of_stock);
        break;
      case "e":
        setProductInfo(SalesDashboardData?.data?.expired_product);
        break;
      default:
        break;
    }

    const selectedName = () => {
      switch (type) {
        case "top":
          return "Top Selling Products";
        case "fast":
          return "Fast Moving Products";
        case "expired":
          return "Expired Products";
        case "soon":
          return "Expiring Soon";
        default:
          return "Top Selling Products";
      }
    };

    setSelectedType(selectedName());
    setOpenInfoModal(true);
  };

  console.log("productInfo", productInfo);
  // Prepare stock status tabs data
  const getStockStatusTabs = () => {
    if (!SalesDashboardData?.data) return [];

    const data = SalesDashboardData.data;

    return [
      {
        value: "stock-status",
        icon: Package,
        label: "Stock Status",
        shortLabel: "Status",
        content: <StockStatusChart data={data} />,
      },
      {
        value: "out-of-stock",
        icon: PackageOpen,
        label: "Out of Stock",
        shortLabel: "Out",
        content: (
          <TopStockedItemsChart
            title="Out of Stock Items"
            items={
              data.out_of_stock?.map((item: any) => ({
                name: item.product__name,
                value: item.quantity_sold,
              })) || []
            }
            color="#ef4444"
            handleViewMore={handleViewMore}
            t={"o"}
          />
        ),
      },
      {
        value: "low-stock",
        icon: Clock,
        label: "Low Stock",
        shortLabel: "Low",
        content: (
          <TopStockedItemsChart
            title="Low Stock Items"
            items={
              data.low_stock?.map((item: any) => ({
                name: item.product__name,
                value: item.quantity_sold,
              })) || []
            }
            color="#eab308"
            handleViewMore={handleViewMore}
            t={"l"}
          />
        ),
      },
      {
        value: "expired",
        icon: Activity,
        label: "Expired",
        shortLabel: "Expired",
        content: (
          <TopStockedItemsChart
            title="Expired Items"
            items={
              data.expired_product?.slice(0, 5).map((item: any) => ({
                name: item.product__name,
                value: item.quantity_sold,
              })) || []
            }
            color="#ef4444"
            handleViewMore={handleViewMore}
            t={"e"}
          />
        ),
      },
    ];
  };

  // Prepare performance tabs data
  const getPerformanceTabs = () => {
    if (!SalesDashboardData?.data) return [];

    const data = SalesDashboardData.data;

    return [
      {
        value: "top-sales",
        icon: TrendingUp,
        label: "Top Sales",
        shortLabel: "Top",
        content: (
          <StockPerformanceChart
            title="Top Selling Products"
            items={
              data.top_selling_products?.slice(0, 5).map((item: any) => ({
                name: item.product__name,
                value: item.quantity_sold,
              })) || []
            }
            color="#3b82f6"
          />
        ),
      },
      {
        value: "fast-moving",
        icon: ShoppingCart,
        label: "Fast Moving",
        shortLabel: "Fast",
        content: (
          <StockPerformanceChart
            title="Fast Moving Products"
            items={
              data.fast_moving_product?.slice(0, 5).map((item: any) => ({
                name: item.product__name,
                value: item.quantity_sold,
              })) || []
            }
            color="#10b981"
          />
        ),
      },
      {
        value: "low-moving",
        icon: TrendingDown,
        label: "Low Moving",
        shortLabel: "Low",
        content: (
          <StockPerformanceChart
            title="Low Moving Products"
            items={
              data.expired_product?.slice(0, 5).map((item: any) => ({
                name: item.product__name,
                value: item.quantity_sold,
              })) || []
            }
            color="#f97316"
          />
        ),
      },
    ];
  };

  const metricsData = getMetricsData();
  const stockStatusTabs = getStockStatusTabs();
  const performanceTabs = getPerformanceTabs();

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 p-4 md:p-6">
      <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
        Overview
      </p>
      <main className="flex flex-1 flex-col gap-4">
        {/* Metrics Cards */}

        {(role === "OWNER" || role === "ADMIN-ATTENDANT") && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {SalesDashboardLoading
              ? [...Array(5)].map((_, index) => (
                  <MetricsCardSkeleton key={index} />
                ))
              : metricsData.map((metric, index) => (
                  <Card
                    key={index}
                    className={`${metric.bgColor} border-gray-200 shadow-sm px-0`}
                  >
                    <CardHeader className="flex flex-row items-center mt-3 justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium">
                        {metric.title}
                      </CardTitle>
                      <metric.icon className={`h-3 w-3 ${metric.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-1xl font-bold">{metric.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        )}

        {/* Store URL and Quick Actions */}
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 mb-6">
          {/* Quick Actions Card - Left Column (OWNER & ADMIN-ATTENDANT only) */}
          {(role === "OWNER" || role === "ADMIN-ATTENDANT") && (
            <Card className="border-gray-200 shadow-sm py-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-[14px]">
                  Frequently used actions for your store management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {quickActions.map((action, index) => (
                    <QuickActionCard
                      key={index}
                      icon={action.icon}
                      title={action.title}
                      description={action.description}
                      href={action.href}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Status Cards - Right Column (Flex on Desktop) */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-4">
            {/* Top Selling */}
            <ProductStatusCard
              title="Top Selling Products"
              type="top"
              description="Highest seller"
              items={
                SalesDashboardData?.data?.top_selling_products?.length
                  ? [
                      SalesDashboardData.data.top_selling_products.reduce(
                        (prev: any, current: any) =>
                          prev.quantity_sold > current.quantity_sold
                            ? prev
                            : current,
                      ),
                    ].map((item) => ({
                      name: item.product__name,
                      value: item.quantity_sold,
                    }))
                  : []
              }
              icon={TrendingUp}
              iconColor="text-green-500"
              bgColor="bg-green-50"
              loading={SalesDashboardLoading}
            />

            {/* Fast Moving */}
            <ProductStatusCard
              title="Fast Moving Items"
              description="Quickest seller"
              type="fast"
              items={
                SalesDashboardData?.data?.fast_moving_product?.length
                  ? [
                      SalesDashboardData.data.fast_moving_product.reduce(
                        (prev: any, current: any) =>
                          prev.quantity_sold > current.quantity_sold
                            ? prev
                            : current,
                      ),
                    ].map((item) => ({
                      name: item.product__name,
                      value: item.quantity_sold,
                    }))
                  : []
              }
              icon={Zap}
              iconColor="text-blue-500"
              bgColor="bg-blue-50"
              loading={SalesDashboardLoading}
            />

            {/* Expired Products */}

            <ProductStatusCard
              title="Expired"
              type="expired"
              description="Expired Products"
              items={
                SalesDashboardData?.data?.expired_product?.length
                  ? [
                      SalesDashboardData.data.expired_product.reduce(
                        (prev: any, current: any) =>
                          prev.quantity_sold > current.quantity_sold
                            ? prev
                            : current,
                      ),
                    ].map((item) => ({
                      name: item.product__name,
                      value: item.quantity_sold,
                    }))
                  : []
              }
              icon={AlertTriangle}
              iconColor="text-red-500"
              bgColor="bg-red-50"
              loading={SalesDashboardLoading}
            />

            {/* Out of Stock */}
            <ProductStatusCard
              title="Expired Soon"
              description="In demand"
              type="soon"
              items={
                SalesDashboardData?.data?.expired_soon?.length
                  ? [
                      SalesDashboardData?.data?.expired_soon.reduce(
                        (prev: any, current: any) =>
                          prev.quantity_sold > current.quantity_sold
                            ? prev
                            : current,
                      ),
                    ].map((item) => ({
                      name: item.product__name,
                      value: item.quantity_sold,
                    }))
                  : []
              }
              icon={PackageX}
              iconColor="text-amber-500"
              bgColor="bg-amber-50"
              loading={SalesDashboardLoading}
            />
          </div>
        </div>

        {/* Fast Moving and Expiring Soon - NEW SECTION */}

        {/* Stock Levels and Performance */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-gray-200 shadow-sm py-2">
            <CardHeader>
              <CardTitle className="text-sm">Stock Levels</CardTitle>
              <CardDescription className="text-[13px]">
                Monitor your inventory status across categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {SalesDashboardLoading ? (
                <ChartSkeleton />
              ) : (
                <Tabs defaultValue="stock-status">
                  <TabsList className="grid w-full grid-cols-4">
                    {stockStatusTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex items-center gap-2"
                      >
                        <tab.icon className="h-3 w-3" />
                        <span className="hidden sm:inline text-[10px] md:text-sm">
                          {tab.label}
                        </span>
                        <span className="sm:hidden text-[10px] md:text-sm ">
                          {tab.shortLabel}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {stockStatusTabs.map((tab) => (
                    <TabsContent
                      key={tab.value}
                      value={tab.value}
                      className="h-[300px]"
                    >
                      {tab.content}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-gray-200 shadow-sm py-2">
            <CardHeader>
              <CardTitle className="text-sm">Stock Performance</CardTitle>
              <CardDescription className="text-[13px]">
                Track your best and worst performing products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {SalesDashboardLoading ? (
                <ChartSkeleton />
              ) : (
                <Tabs defaultValue="top-sales">
                  <TabsList className="grid w-full grid-cols-3">
                    {performanceTabs.map((tab: any) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex items-center gap-2"
                      >
                        <tab.icon className="h-4 w-4" />
                        <span className="hidden sm:inline text-[10px] md:text-sm">
                          {tab.label}
                        </span>
                        <span className="sm:hidden text-[10px] md:text-sm">
                          {tab.shortLabel}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {performanceTabs.map((tab: any) => (
                    <TabsContent
                      key={tab.value}
                      value={tab.value}
                      className="h-[300px]"
                    >
                      {tab.content}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <CustomModal
        isOpen={openInfoModal}
        onClose={closeInfoModal}
        trigger={true}
        title={selectedType}
        description=""
      >
        <ProductsInfo data={productInfo} />
      </CustomModal>
    </div>
  );
}
