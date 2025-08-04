import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Search, 
  Eye, 
  Edit, 
  Download,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Store,
  Calendar,
  DollarSign,
  FileText,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface OrderData {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  storeId: string;
  storeName: string;
  merchantName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'processing' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMerchant, setFilterMerchant] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${orderId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "تم تحديث حالة الطلب بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث حالة الطلب", variant: "destructive" });
    }
  });

  const filteredOrders = orders.filter((order: OrderData) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesMerchant = filterMerchant === "all" || order.storeId === filterMerchant;
    
    let matchesDate = true;
    if (filterDate !== "all") {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      switch (filterDate) {
        case "today":
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesMerchant && matchesDate;
  });

  const handleStatusChange = (order: OrderData, newStatus: string) => {
    updateOrderMutation.mutate({
      orderId: order.id,
      status: newStatus
    });
  };

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "accepted": return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "processing": return <Package className="w-4 h-4 text-purple-500" />;
      case "delivered": return <Truck className="w-4 h-4 text-green-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "في الانتظار";
      case "accepted": return "مقبول";
      case "processing": return "قيد التحضير";
      case "delivered": return "تم التسليم";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["رقم الطلب", "العميل", "المتجر", "المبلغ", "الحالة", "التاريخ"].join(","),
      ...filteredOrders.map((order: OrderData) => [
        order.id,
        order.customerName,
        order.storeName,
        order.totalAmount,
        getStatusLabel(order.status),
        new Date(order.createdAt).toLocaleDateString("ar-SA")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const todayOrders = orders.filter((o: OrderData) => 
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const pendingOrders = orders.filter((o: OrderData) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o: OrderData) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o: OrderData) => o.status === 'cancelled').length;
  const totalRevenue = orders
    .filter((o: OrderData) => o.status === 'delivered')
    .reduce((sum: number, o: OrderData) => sum + o.totalAmount, 0);

  // Get unique merchants for filter
  const uniqueMerchants = Array.from(new Set(orders.map((o: OrderData) => o.storeId)))
    .map(storeId => {
      const order = orders.find((o: OrderData) => o.storeId === storeId);
      return { id: storeId, name: order?.storeName || "" };
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-reverse space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للوحة الإدارة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
            <p className="text-gray-600 text-sm">إدارة ومتابعة جميع الطلبات في النظام</p>
          </div>
        </div>
        <div className="flex items-center space-x-reverse space-x-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            النظام
          </Badge>
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-800">{totalOrders}</p>
                <p className="text-sm text-blue-600">إجمالي الطلبات</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-800">{todayOrders}</p>
                <p className="text-sm text-green-600">طلبات اليوم</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-800">{pendingOrders}</p>
                <p className="text-sm text-yellow-600">في الانتظار</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-800">{deliveredOrders}</p>
                <p className="text-sm text-emerald-600">تم التسليم</p>
              </div>
              <Truck className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-800">{cancelledOrders}</p>
                <p className="text-sm text-red-600">ملغية</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-800">{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-purple-600">ريال إجمالي</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="البحث في الطلبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="accepted">مقبول</SelectItem>
                  <SelectItem value="processing">قيد التحضير</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="merchant">المتجر</Label>
              <Select value={filterMerchant} onValueChange={setFilterMerchant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المتاجر</SelectItem>
                  {uniqueMerchants.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التواريخ</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            قائمة الطلبات ({filteredOrders.length})
          </h2>
          
          {filteredOrders.map((order: OrderData) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-reverse space-x-4 mb-3">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          #{order.id.slice(-8)}
                        </h3>
                      </div>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <User className="w-4 h-4" />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Store className="w-4 h-4" />
                        <span>{order.storeName}</span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center space-x-reverse space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">العناصر</p>
                      <p className="text-lg font-bold text-gray-900">
                        {order.items.length}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">المبلغ</p>
                      <p className="text-lg font-bold text-green-800">
                        {order.totalAmount.toLocaleString()} ريال
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => handleStatusChange(order, value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="accepted">مقبول</SelectItem>
                        <SelectItem value="processing">قيد التحضير</SelectItem>
                        <SelectItem value="delivered">تم التسليم</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد طلبات مطابقة للبحث</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب #{selectedOrder?.id.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات العميل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الاسم</Label>
                    <p className="text-lg">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">البريد الإلكتروني</Label>
                    <p className="text-lg">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">عنوان التوصيل</Label>
                    <p className="text-lg">{selectedOrder.shippingAddress}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Merchant Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات المتجر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">اسم المتجر</Label>
                    <p className="text-lg">{selectedOrder.storeName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">التاجر</Label>
                    <p className="text-lg">{selectedOrder.merchantName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">طريقة الدفع</Label>
                    <p className="text-lg">{selectedOrder.paymentMethod}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">تفاصيل المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.price * item.quantity).toLocaleString()} ريال</p>
                          <p className="text-sm text-gray-600">{item.price} ريال للوحدة</p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>المجموع الكلي:</span>
                        <span className="text-green-800">{selectedOrder.totalAmount.toLocaleString()} ريال</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status & Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">حالة الطلب والتوقيتات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      {getStatusIcon(selectedOrder.status)}
                      <p className="font-semibold mt-2">{getStatusLabel(selectedOrder.status)}</p>
                      <p className="text-sm text-gray-600">الحالة الحالية</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="font-semibold mt-2">
                        {new Date(selectedOrder.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                      <p className="text-sm text-gray-600">تاريخ الطلب</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600 mx-auto" />
                      <p className="font-semibold mt-2">
                        {new Date(selectedOrder.updatedAt).toLocaleDateString("ar-SA")}
                      </p>
                      <p className="text-sm text-gray-600">آخر تحديث</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}