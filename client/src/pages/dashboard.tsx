import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Edit, Trash2, ShoppingCart, ArrowLeft, Store } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/dashboard-stats";

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
      pending: { label: "في الانتظار", variant: "secondary" as const },
      confirmed: { label: "مؤكد", variant: "default" as const },
      shipped: { label: "تم الشحن", variant: "outline" as const },
      delivered: { label: "تم التسليم", variant: "secondary" as const },
    };
    
    return statusMap[status] || { label: status, variant: "secondary" as const };
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "text-warning-orange",
      confirmed: "text-success-green",
      shipped: "text-purple-accent",
      delivered: "text-success-green",
    };
    
    return colorMap[status] || "text-gray-600";
  };

  return (
    <div>
      {/* Dashboard Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button className="bg-primary-blue hover:bg-blue-600">
                <Plus className="w-4 h-4 ml-2" />
                إنشاء متجر جديد
              </Button>
              <span className="text-sm text-gray-500">مرحباً، {user.fullName}</span>
            </div>
            <div className="flex items-center space-x-reverse space-x-6">
              <h1 className="text-xl font-bold text-gray-900">إدارة المحتوى</h1>
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                <Store className="w-4 h-4 ml-1" />
                إدارة المنتجات والمبيعات
              </div>
            </div>
            <Button variant="ghost" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && !statsLoading && (
          <DashboardStats
            totalViews={stats.totalViews || 0}
            totalSales={stats.totalSales || "$0.00"}
            totalOrders={stats.totalOrders || 0}
            totalProducts={stats.totalProducts || 0}
          />
        )}

        {/* Dashboard Tabs */}
        <Card className="shadow-sm">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b">
              <TabsList className="h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="overview" 
                  className="h-auto py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary-blue data-[state=active]:text-primary-blue"
                >
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="h-auto py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary-blue data-[state=active]:text-primary-blue"
                >
                  المنتجات
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="h-auto py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary-blue data-[state=active]:text-primary-blue"
                >
                  الطلبات
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="h-auto py-4 px-6 border-b-2 border-transparent data-[state=active]:border-primary-blue data-[state=active]:text-primary-blue"
                >
                  الإعدادات
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">ما أداء المتجر</h3>
                    <Button variant="link" className="text-primary-blue">عرض الكل</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">المنتجات النشطة</span>
                          <span className="text-2xl font-bold text-gray-900">42</span>
                        </div>
                        <div className="text-sm text-gray-600">متوسط التقييم: 4.6 ⭐</div>
                        <div className="text-sm text-gray-600">إجمالي المراجعات: 89</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">طلبات معلقة</span>
                          <span className="text-2xl font-bold text-gray-900">7</span>
                        </div>
                        <div className="text-sm text-gray-600">طلبات في الانتظار</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <Card className="bg-orange-50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">تنبيه المخزون ⚠️</h4>
                      <div className="space-y-2">
                        <div className="bg-orange-100 rounded p-2">
                          <span className="text-sm font-medium text-orange-800">منتج 1</span>
                          <div className="text-xs text-orange-600">SKU: TEA-001</div>
                        </div>
                        <div className="bg-orange-100 rounded p-2">
                          <span className="text-sm font-medium text-orange-800">منتج 2</span>
                          <div className="text-xs text-orange-600">SKU: TEA-003</div>
                        </div>
                        <div className="bg-red-100 rounded p-2">
                          <span className="text-sm font-medium text-red-800">نفد المخزون</span>
                          <div className="text-xs text-red-600">SKU: BAG-512</div>
                        </div>
                      </div>
                      <Button variant="link" className="w-full mt-3 text-orange-600">
                        إدارة المخزون
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">قائمة المنتجات</h3>
                <Button className="bg-success-green hover:bg-green-600">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج جديد
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">المخزون</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">منتج تجريبي</div>
                          <div className="text-sm text-gray-500">(Demo Product)</div>
                        </div>
                      </TableCell>
                      <TableCell>منتج</TableCell>
                      <TableCell>
                        <Badge className="bg-success-green text-white">منشور</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-warning-orange text-white">غذائية</Badge>
                      </TableCell>
                      <TableCell>15 قطعة</TableCell>
                      <TableCell>اليوم</TableCell>
                      <TableCell>
                        <div className="flex space-x-reverse space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">الطلبات الأخيرة ⏰</h3>
                <Button variant="link" className="text-primary-blue">عرض الكل</Button>
              </div>

              {ordersLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <div className="space-y-4">
                  {orders && Array.isArray(orders) && orders.map((order: any) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-reverse space-x-3">
                            <ShoppingCart className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">طلب رقم {order.orderNumber}</div>
                              <div className="text-sm text-gray-500">
                                {Array.isArray(order.items) ? order.items.length : 1} منتج
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-gray-900">${order.totalAmount}</div>
                            <div className={`text-sm ${getStatusColor(order.status)}`}>
                              {getStatusBadge(order.status).label}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">إعدادات النظام</h3>
              
              <Card className="bg-gray-50 mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">⚡ حالة النظام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-success-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        ✓
                      </div>
                      <div className="text-sm font-medium text-gray-900">قاعدة البيانات</div>
                      <div className="text-xs text-success-green">99.9%</div>
                      <div className="text-xs text-gray-500">وقت التشغيل</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-success-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        ✓
                      </div>
                      <div className="text-sm font-medium text-gray-900">التخزين</div>
                      <div className="text-xs text-success-green">23.8%</div>
                      <div className="text-xs text-gray-500">استخدام المتاح</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-success-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        ✓
                      </div>
                      <div className="text-sm font-medium text-gray-900">البريد الإلكتروني</div>
                      <div className="text-xs text-success-green">65.5%</div>
                      <div className="text-xs text-gray-500">استخدام الذاكرة</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <h4 className="font-bold text-gray-900">إعدادات الأمان</h4>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">المصادقة الثنائية</div>
                            <div className="text-sm text-gray-600">تفعيل المصادقة للمستخدمين</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">التحقق من البريد الإلكتروني</div>
                            <div className="text-sm text-gray-600">طلب التحقق من البريد عند التسجيل</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <Label htmlFor="session-timeout">مدة انتهاء الجلسة (بالدقائق)</Label>
                        <Input id="session-timeout" type="number" defaultValue="3600" className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <Label htmlFor="max-attempts">الحد الأقصى لمحاولات تسجيل الدخول</Label>
                        <Input id="max-attempts" type="number" defaultValue="5" className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">طلب رمز حماية في كلمة المرور</div>
                            <div className="text-sm text-gray-600">طلب رموز خاصة (#$@) في كلمة المرور</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
