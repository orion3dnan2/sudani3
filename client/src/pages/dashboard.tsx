import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, ShoppingCart, Package, Settings, Plus, Download } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'merchant')) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", user?.id],
    enabled: !!user?.id,
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/dashboard/orders", user?.id],
    enabled: !!user?.id,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                <Eye className="w-4 h-4 ml-2" />
                عرض المتجر
              </Button>
              <Badge className="bg-orange-100 text-orange-700 px-3 py-1">
                متاح عملي
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900">لوحة إدارة المتجر</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm">مشاهدات المتجر</p>
                  <p className="text-3xl font-bold text-orange-800">
                    {stats?.totalViews ? stats.totalViews.toLocaleString() : '2,340'}
                  </p>
                </div>
                <Eye className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm">إيرادات الشهر</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {stats?.totalSales || '$15,420'}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-green-800">
                    {stats?.totalOrders || '128'}
                  </p>
                </div>
                <ShoppingCart className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {stats?.totalProducts || '45'}
                  </p>
                </div>
                <Package className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            className="h-16 flex flex-col justify-center bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setLocation("/add-product")}
          >
            <Plus className="w-6 h-6 mb-2" />
            <span>إضافة منتج جديد</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col justify-center border-blue-200 hover:bg-blue-50"
            onClick={() => setLocation("/products-management")}
          >
            <Package className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-blue-700">إدارة المنتجات</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200 hover:bg-blue-50">
            <ShoppingCart className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-blue-700">إدارة الطلبات</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex flex-col justify-center border-blue-200 hover:bg-blue-50">
            <Settings className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-blue-700">إعدادات المتجر</span>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Store Performance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">ما أداء المتجر</CardTitle>
                  <Button variant="link" className="text-blue-600 p-0">عرض الكل</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="text-3xl font-bold text-green-600">42</div>
                    <div>
                      <p className="text-sm text-gray-600">المنتجات النشطة</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="text-3xl font-bold text-amber-600">7</div>
                    <div>
                      <p className="text-sm text-gray-600">طلبات معلقة</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="text-3xl font-bold text-yellow-600">4.6</div>
                    <div>
                      <p className="text-sm text-gray-600">متوسط التقييم ⭐</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="text-3xl font-bold text-blue-600">89</div>
                    <div>
                      <p className="text-sm text-gray-600">إجمالي المراجعات</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">الطلبات الأخيرة ⏰</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersLoading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">أحمد محمد</div>
                          <div className="text-sm text-gray-500">
                            ORD-001 • 3 منتجات • منذ 15 دقيقة
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">$125.5</div>
                        <div className="text-sm text-yellow-600">في الانتظار</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">فاطمة علي</div>
                          <div className="text-sm text-gray-500">
                            ORD-002 • 1 منتجات • منذ ساعة
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">$45</div>
                        <div className="text-sm text-blue-600">مؤكد</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">محمد يسرا</div>
                          <div className="text-sm text-gray-500">
                            ORD-003 • 2 منتجات • منذ 3 ساعات
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">$89.99</div>
                        <div className="text-sm text-purple-600">تم الشحن</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-reverse space-x-3">
                        <ShoppingCart className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">عائشة أحمد</div>
                          <div className="text-sm text-gray-500">
                            ORD-004 • 4 منتجات • منذ يوم
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900">$234.75</div>
                        <div className="text-sm text-green-600">تم التسليم</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="mt-8">
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-orange-800">تنبيه المخزون ⚠️</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-orange-800">عطر صندل سوداني</div>
                    <div className="text-sm text-orange-600">TEA-001</div>
                  </div>
                </div>
                <Badge className="bg-orange-200 text-orange-800">2 قليل</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-yellow-800">دكركة طيبش</div>
                    <div className="text-sm text-yellow-600">TEA-003</div>
                  </div>
                </div>
                <Badge className="bg-yellow-200 text-yellow-800">5 متوسط</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-red-800">حقيبة سودانية</div>
                    <div className="text-sm text-red-600">BAG-012</div>
                  </div>
                </div>
                <Badge className="bg-red-200 text-red-800">نفد المخزون</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}