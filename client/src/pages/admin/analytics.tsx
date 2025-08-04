import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d");
  const [metric, setMetric] = useState("revenue");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics", dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    }
  });

  // Mock data for demonstration
  const mockData = {
    overview: {
      totalRevenue: 45231.89,
      revenueChange: 12.5,
      totalOrders: 432,
      ordersChange: 8.2,
      totalUsers: 1250,
      usersChange: 15.3,
      totalProducts: 89,
      productsChange: 5.1
    },
    revenueData: [
      { name: "يناير", revenue: 4000, orders: 120 },
      { name: "فبراير", revenue: 3000, orders: 98 },
      { name: "مارس", revenue: 5000, orders: 156 },
      { name: "أبريل", revenue: 4500, orders: 145 },
      { name: "مايو", revenue: 6000, orders: 189 },
      { name: "يونيو", revenue: 5500, orders: 167 },
      { name: "يوليو", revenue: 7000, orders: 210 }
    ],
    categoryData: [
      { name: "حلويات", value: 35, color: "#8884d8" },
      { name: "عطور", value: 25, color: "#82ca9d" },
      { name: "بخور", value: 20, color: "#ffc658" },
      { name: "ملابس", value: 15, color: "#ff7300" },
      { name: "أخرى", value: 5, color: "#8dd1e1" }
    ],
    userGrowth: [
      { name: "الأسبوع 1", users: 20 },
      { name: "الأسبوع 2", users: 35 },
      { name: "الأسبوع 3", users: 42 },
      { name: "الأسبوع 4", users: 58 },
      { name: "الأسبوع 5", users: 69 },
      { name: "الأسبوع 6", users: 78 },
      { name: "الأسبوع 7", users: 89 }
    ],
    topProducts: [
      { name: "طلب أقلامي فراولة", sales: 125, revenue: 1000 },
      { name: "عطر صندل سوداني", sales: 89, revenue: 2225 },
      { name: "دكركة طيبش", sales: 67, revenue: 1005 },
      { name: "حلاوة سمسم", sales: 45, revenue: 675 },
      { name: "بخور عود", sales: 32, revenue: 960 }
    ]
  };

  const data = analyticsData || mockData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">جاري تحميل البيانات...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التطوير والتحليلات</h1>
          <p className="text-gray-600">تحليل أداء المنصة وإحصائيات المبيعات</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 3 أشهر</SelectItem>
              <SelectItem value="1y">السنة الماضية</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                <p className={`text-xs flex items-center ${data.overview.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.overview.revenueChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatPercentage(data.overview.revenueChange)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد الطلبات</p>
                <p className="text-2xl font-bold">{data.overview.totalOrders}</p>
                <p className={`text-xs flex items-center ${data.overview.ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.overview.ordersChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatPercentage(data.overview.ordersChange)}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المستخدمين</p>
                <p className="text-2xl font-bold">{data.overview.totalUsers}</p>
                <p className={`text-xs flex items-center ${data.overview.usersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.overview.usersChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatPercentage(data.overview.usersChange)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عدد المنتجات</p>
                <p className="text-2xl font-bold">{data.overview.totalProducts}</p>
                <p className={`text-xs flex items-center ${data.overview.productsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.overview.productsChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {formatPercentage(data.overview.productsChange)}
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            المبيعات
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            الأداء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المبيعات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name === 'revenue' ? 'المبيعات' : 'الطلبات']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="المبيعات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>اتجاه المبيعات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'المبيعات']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>نمو المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'مستخدمين جدد']} />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} name="مستخدمين جدد" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>إجمالي المستخدمين</span>
                    <span className="font-bold">{data.overview.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>مستخدمين نشطين</span>
                    <span className="font-bold">892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>مستخدمين جدد هذا الشهر</span>
                    <span className="font-bold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>معدل الاحتفاظ</span>
                    <span className="font-bold">78.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المنتجات حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topProducts.map((product: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.sales} مبيعة</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(product.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء الخادم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>وقت الاستجابة</span>
                    <span className="font-bold text-green-600">127ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>معدل التوفر</span>
                    <span className="font-bold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>استخدام الذاكرة</span>
                    <span className="font-bold text-yellow-600">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>استخدام المعالج</span>
                    <span className="font-bold text-blue-600">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأمان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>محاولات دخول فاشلة</span>
                    <span className="font-bold text-red-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>عناوين IP محظورة</span>
                    <span className="font-bold text-gray-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>شهادة SSL</span>
                    <span className="font-bold text-green-600">صالحة</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>آخر فحص أمني</span>
                    <span className="font-bold text-green-600">منذ ساعة</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>النسخ الاحتياطية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>آخر نسخة احتياطية</span>
                    <span className="font-bold text-green-600">منذ 4 ساعات</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>حجم النسخة</span>
                    <span className="font-bold">2.3 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>عدد النسخ</span>
                    <span className="font-bold">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>التشفير</span>
                    <span className="font-bold text-green-600">مفعل</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}