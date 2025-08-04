import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Store, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Star,
  Settings,
  Check,
  X,
  Edit,
  Trash2,
  Download,
  Eye,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface StoreDetailsData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isActive: boolean;
  settings: any;
  createdAt: string;
  owner: {
    fullName: string;
    city: string;
    email: string;
    phone: string;
  };
}

interface ProductData {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: number;
  isActive: boolean;
  image: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customerId: string;
}

export default function StoreDetails() {
  const [match] = useRoute("/admin/stores/:storeId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const storeId = match ? (match as any).storeId : null;

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["/api/admin/stores", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/stores/${storeId}`);
      if (!response.ok) throw new Error("Failed to fetch store");
      return response.json();
    },
    enabled: !!storeId
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/store", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/products/store/${storeId}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!storeId
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/store", storeId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/store/${storeId}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    enabled: !!storeId
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ updates }: { updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/stores/${storeId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores", storeId] });
      toast({ title: "تم تحديث المتجر بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المتجر", variant: "destructive" });
    }
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/admin/stores/${storeId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم حذف المتجر بنجاح" });
      setLocation("/admin/stores");
    },
    onError: () => {
      toast({ title: "خطأ في حذف المتجر", variant: "destructive" });
    }
  });

  const handleToggleStatus = () => {
    if (!store) return;
    updateStoreMutation.mutate({
      updates: { isActive: !store.isActive }
    });
  };

  const handleDeleteStore = () => {
    if (confirm("هل أنت متأكد من حذف هذا المتجر؟ سيتم حذف جميع المنتجات والطلبات المرتبطة به.")) {
      deleteStoreMutation.mutate();
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">جاري التحميل...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">المتجر غير موجود</div>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p: ProductData) => p.isActive).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: OrderData) => sum + parseFloat(order.totalAmount), 0);
  const pendingOrders = orders.filter((o: OrderData) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-reverse space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin/stores")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة لإدارة المتاجر
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-600 text-sm">تفاصيل المتجر الكاملة</p>
          </div>
        </div>
        <div className="flex items-center space-x-reverse space-x-2">
          <Badge 
            variant={store.isActive ? "default" : "secondary"}
            className={store.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {store.isActive ? "نشط" : "معطل"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={store.isActive ? "text-red-600 border-red-200" : "text-green-600 border-green-200"}
          >
            {store.isActive ? "تعطيل المتجر" : "تفعيل المتجر"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteStore}
            className="text-red-600 border-red-200"
          >
            <Trash2 className="w-4 h-4 ml-1" />
            حذف المتجر
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-800">{totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-blue-600">إجمالي الإيرادات</p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-800">{totalOrders}</p>
                <p className="text-sm text-green-600">إجمالي الطلبات</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-800">{totalProducts}</p>
                <p className="text-sm text-purple-600">إجمالي المنتجات</p>
              </div>
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-800">{pendingOrders}</p>
                <p className="text-sm text-yellow-600">طلبات معلقة</p>
              </div>
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-800">4.5</p>
                <p className="text-sm text-orange-600">التقييم</p>
              </div>
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">معلومات المتجر</TabsTrigger>
          <TabsTrigger value="products">المنتجات ({totalProducts})</TabsTrigger>
          <TabsTrigger value="orders">الطلبات ({totalOrders})</TabsTrigger>
          <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
        </TabsList>

        {/* Store Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="w-5 h-5 ml-2" />
                  تفاصيل المتجر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">اسم المتجر</label>
                  <p className="text-lg font-semibold">{store.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">الوصف</label>
                  <p className="text-gray-700">{store.description || "لا يوجد وصف"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">تاريخ الإنشاء</label>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 ml-2" />
                    {new Date(store.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">الحالة</label>
                  <Badge 
                    variant={store.isActive ? "default" : "secondary"}
                    className={store.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {store.isActive ? "نشط" : "معطل"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Owner Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 ml-2" />
                  معلومات صاحب المتجر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                  <p className="text-lg font-semibold">{store.owner.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 ml-2" />
                    {store.owner.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 ml-2" />
                    {store.owner.phone || "غير محدد"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">المدينة</label>
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 ml-2" />
                    {store.owner.city || "غير محدد"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>منتجات المتجر</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">جاري تحميل المنتجات...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد منتجات في هذا المتجر</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product: ProductData) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">{product.price} ر.س</span>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "نشط" : "معطل"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">المخزون: {product.stock}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>طلبات المتجر</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">جاري تحميل الطلبات...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد طلبات لهذا المتجر</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: OrderData) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">#{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-green-600">{order.totalAmount} ر.س</p>
                            <Badge variant={
                              order.status === "pending" ? "secondary" :
                              order.status === "confirmed" ? "default" :
                              order.status === "shipped" ? "outline" : "default"
                            }>
                              {order.status === "pending" ? "معلق" :
                               order.status === "confirmed" ? "مؤكد" :
                               order.status === "shipped" ? "مُرسل" : "مُسلم"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الأداء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>معدل التحويل</span>
                  <span className="font-bold">12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>متوسط قيمة الطلب</span>
                  <span className="font-bold">{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0'} ر.س</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>عدد العملاء</span>
                  <span className="font-bold">{Math.floor(totalOrders * 0.7)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>معدل العائد</span>
                  <span className="font-bold">2.1%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات المنتجات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>المنتجات النشطة</span>
                  <span className="font-bold text-green-600">{activeProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>المنتجات المعطلة</span>
                  <span className="font-bold text-red-600">{totalProducts - activeProducts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>المنتجات الأكثر مبيعاً</span>
                  <span className="font-bold">منتج 1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>المنتجات قليلة المخزون</span>
                  <span className="font-bold text-orange-600">
                    {products.filter((p: ProductData) => p.stock < 10).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}