import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Store, 
  Search, 
  Eye, 
  Check, 
  X, 
  ArrowLeft, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface StoreData {
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

export default function StoresManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["/api/admin/stores"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    }
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ storeId, updates }: { storeId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/stores/${storeId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      toast({ title: "تم تحديث المتجر بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المتجر", variant: "destructive" });
    }
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/stores/${storeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      toast({ title: "تم حذف المتجر بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المتجر", variant: "destructive" });
    }
  });

  const filteredStores = stores.filter((store: StoreData) => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && store.isActive) ||
                         (filterStatus === "inactive" && !store.isActive) ||
                         (filterStatus === "pending" && !store.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (store: StoreData) => {
    updateStoreMutation.mutate({
      storeId: store.id,
      updates: { isActive: !store.isActive }
    });
  };

  const handleDeleteStore = (storeId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المتجر؟")) {
      deleteStoreMutation.mutate(storeId);
    }
  };

  // Calculate stats
  const totalStores = stores.length;
  const activeStores = stores.filter((s: StoreData) => s.isActive).length;
  const inactiveStores = stores.filter((s: StoreData) => !s.isActive).length;

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
            <h1 className="text-2xl font-bold text-gray-900">إدارة المتاجر</h1>
            <p className="text-gray-600 text-sm">إدارة وتنظيم جميع المتاجر في المنصة</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          متقدم
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-800">{inactiveStores}</p>
                <p className="text-sm text-red-600">معطلة</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-800">1</p>
                <p className="text-sm text-yellow-600">في الانتظار</p>
              </div>
              <Settings className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-800">{activeStores}</p>
                <p className="text-sm text-green-600">نشطة</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-800">{totalStores}</p>
                <p className="text-sm text-blue-600">إجمالي المتاجر</p>
              </div>
              <Store className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في المتاجر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-32">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="inactive">معطلة</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores Grid */}
      {isLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {filteredStores.map((store: StoreData) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Store Info */}
                  <div className="flex items-start space-x-reverse space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-reverse space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                        <Badge 
                          variant={store.isActive ? "default" : "secondary"}
                          className={store.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {store.isActive ? "نشط" : "معطل"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">{store.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-reverse space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{store.owner.fullName}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{store.owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{store.owner.phone}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>آخر نشاط منذ 5 ساعات</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-reverse space-x-6 text-center">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-lg font-bold text-purple-800">
                          {Math.floor(Math.random() * 50000) + 5000}
                        </p>
                        <p className="text-xs text-purple-600">إيراد</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Store className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-lg font-bold text-green-800">
                          {Math.floor(Math.random() * 150) + 50}
                        </p>
                        <p className="text-xs text-green-600">طلب</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-blue-800">
                          {Math.floor(Math.random() * 50) + 10}
                        </p>
                        <p className="text-xs text-blue-600">منتج</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-lg font-bold text-yellow-800">
                          {(Math.random() * 2 + 3).toFixed(1)}
                        </p>
                        <p className="text-xs text-yellow-600">التقييم</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => setLocation(`/admin/stores/${store.id}`)}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض التفاصيل
                    </Button>
                    
                    {store.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleToggleStatus(store)}
                      >
                        تعطيل المتجر
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleToggleStatus(store)}
                      >
                        تفعيل المتجر
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredStores.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد متاجر مطابقة للبحث</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}