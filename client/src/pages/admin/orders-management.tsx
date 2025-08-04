import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Search, Eye, Edit, Package, Truck, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface OrderData {
  id: string;
  orderNumber: string;
  customerId: string;
  storeId: string;
  status: string;
  totalAmount: string;
  items: any[];
  shippingAddress: any;
  createdAt: string;
  customer?: {
    fullName: string;
    email: string;
    phone: string;
  };
  store?: {
    name: string;
    owner: string;
  };
}

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    }
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/admin/stores"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${orderId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "تم تحديث الطلب بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث الطلب", variant: "destructive" });
    }
  });

  const filteredOrders = orders.filter((order: OrderData) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.store?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesStore = filterStore === "all" || order.storeId === filterStore;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const handleStatusChange = (order: OrderData, newStatus: string) => {
    updateOrderMutation.mutate({
      orderId: order.id,
      updates: { status: newStatus }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed": return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "shipped": return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered": return <Package className="w-4 h-4 text-green-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "في الانتظار";
      case "confirmed": return "مؤكد";
      case "shipped": return "تم الشحن";
      case "delivered": return "تم التسليم";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "confirmed": return "default";
      case "shipped": return "outline";
      case "delivered": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum: number, order: OrderData) => {
      if (order.status !== 'cancelled') {
        return sum + parseFloat(order.totalAmount);
      }
      return sum;
    }, 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-600">إدارة ومتابعة جميع طلبات العملاء</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{orders.filter((o: OrderData) => o.status === 'pending').length}</p>
                <p className="text-sm text-gray-600">في الانتظار</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{orders.filter((o: OrderData) => o.status === 'shipped').length}</p>
                <p className="text-sm text-gray-600">تم الشحن</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{orders.filter((o: OrderData) => o.status === 'delivered').length}</p>
                <p className="text-sm text-gray-600">تم التسليم</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{getTotalRevenue().toFixed(2)}</p>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="ابحث في الطلبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="store">المتجر</Label>
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المتاجر</SelectItem>
                  {stores.map((store: any) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المتجر</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: OrderData) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer?.fullName}</div>
                        <div className="text-sm text-gray-500">{order.customer?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.store?.name}</TableCell>
                    <TableCell className="font-medium">{order.totalAmount} ريال</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <Badge variant={getStatusColor(order.status) as any}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل الطلب #{selectedOrder?.orderNumber}</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>العميل</Label>
                                    <p className="text-sm">{selectedOrder.customer?.fullName}</p>
                                  </div>
                                  <div>
                                    <Label>الهاتف</Label>
                                    <p className="text-sm">{selectedOrder.customer?.phone}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>المتجر</Label>
                                  <p className="text-sm">{selectedOrder.store?.name}</p>
                                </div>
                                <div>
                                  <Label>المنتجات</Label>
                                  <div className="text-sm">
                                    {selectedOrder.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between">
                                        <span>منتج {index + 1}</span>
                                        <span>الكمية: {item.quantity}</span>
                                        <span>{item.price} ريال</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Label>إجمالي المبلغ</Label>
                                  <span className="font-bold">{selectedOrder.totalAmount} ريال</span>
                                </div>
                                <div>
                                  <Label>تحديث الحالة</Label>
                                  <Select 
                                    value={selectedOrder.status} 
                                    onValueChange={(value) => handleStatusChange(selectedOrder, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">في الانتظار</SelectItem>
                                      <SelectItem value="confirmed">مؤكد</SelectItem>
                                      <SelectItem value="shipped">تم الشحن</SelectItem>
                                      <SelectItem value="delivered">تم التسليم</SelectItem>
                                      <SelectItem value="cancelled">ملغي</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Select onValueChange={(value) => handleStatusChange(order, value)}>
                          <SelectTrigger className="w-32">
                            <Edit className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">في الانتظار</SelectItem>
                            <SelectItem value="confirmed">تأكيد</SelectItem>
                            <SelectItem value="shipped">شحن</SelectItem>
                            <SelectItem value="delivered">تسليم</SelectItem>
                            <SelectItem value="cancelled">إلغاء</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}