import { Card, CardContent } from "@/components/ui/card";
import { Eye, TrendingUp, ShoppingCart, Package } from "lucide-react";

interface DashboardStatsProps {
  totalViews: number;
  totalSales: string;
  totalOrders: number;
  totalProducts: number;
}

export default function DashboardStats({ totalViews, totalSales, totalOrders, totalProducts }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-orange-400 to-orange-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">مشاهدات المتجر</p>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-400 to-purple-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">قيمة المبيعات</p>
              <p className="text-2xl font-bold">{totalSales}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-400 to-green-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">إجمالي الطلبات</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">عدد المنتجات</p>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
