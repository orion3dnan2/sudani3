import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, Eye, Edit, Trash2, List, Grid3X3, Search, Package, Play, Pause, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  image?: string;
}

export default function ProductsManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'merchant')) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Fetch products for the current user
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/user", user?.id],
    enabled: !!user?.id,
  });

  // Get user's store name
  const { data: stores } = useQuery({
    queryKey: ["/api/stores/owner", user?.id],
    enabled: !!user?.id,
  });

  const storeName = stores && Array.isArray(stores) && stores.length > 0 ? stores[0].name : "المتجر";

  // Product management mutations
  const toggleProductStatusMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('فشل في تحديث حالة المنتج');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/user"] });
      toast({ title: "تم تحديث حالة المنتج بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث حالة المنتج", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف المنتج');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/user"] });
      toast({ title: "تم حذف المنتج بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المنتج", variant: "destructive" });
    },
  });

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.isActive) ||
                         (statusFilter === "inactive" && !product.isActive);
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleStatus = (productId: string, currentStatus: boolean) => {
    toggleProductStatusMutation.mutate({ productId, isActive: !currentStatus });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setLocation("/add-product")}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
              <div className="text-sm text-gray-600">
                المتجر: {storeName}
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-sm text-gray-500">{products.length} منتج في متجرك</span>
              <h1 className="text-xl font-bold text-gray-900">إدارة المنتجات</h1>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 ml-1" />
                العودة
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Package className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              ℹ
            </div>
            <div>
              <h3 className="font-medium text-blue-900">منتجات {storeName}</h3>
              <p className="text-sm text-blue-700">
                متجرك متاح في السوق العام للبيع • يمكن للمشترين رؤية وشراء منتجاتك
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="حلويات">حلويات</SelectItem>
                  <SelectItem value="عطور">عطور</SelectItem>
                  <SelectItem value="بخور">بخور</SelectItem>
                  <SelectItem value="ملابس">ملابس</SelectItem>
                  <SelectItem value="أطعمة">أطعمة</SelectItem>
                  <SelectItem value="مشروبات">مشروبات</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="حلويات">حلويات</SelectItem>
                  <SelectItem value="مشروبات">مشروبات</SelectItem>
                  <SelectItem value="طعام">طعام</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 w-60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {productsLoading ? (
          <div className="text-center py-12">
            <div className="text-lg">جاري تحميل المنتجات...</div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: any) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <img 
                    src={product.image || "https://via.placeholder.com/300x200?text=منتج"} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${product.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                    {product.isActive ? 'نشط' : 'متوقف'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-500">{product.stock || 50} قطعة</span>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 ${product.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                      onClick={() => handleToggleStatus(product.id, product.isActive)}
                      disabled={toggleProductStatusMutation.isPending}
                    >
                      {product.isActive ? <Pause className="w-4 h-4 ml-1" /> : <Play className="w-4 h-4 ml-1" />}
                      {product.isActive ? 'إيقاف' : 'نشر'}
                    </Button>
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredProducts.map((product: any, index: number) => (
              <div key={product.id} className={`p-4 ${index !== filteredProducts.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex items-center space-x-reverse space-x-4">
                  <img 
                    src={product.image || "https://via.placeholder.com/64x64?text=منتج"} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center space-x-reverse space-x-4 mt-2">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      <Badge className={`${product.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                        {product.isActive ? 'نشط' : 'متوقف'}
                      </Badge>
                      <span className="text-sm text-gray-500">{product.stock || 50} قطعة</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`${product.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                      onClick={() => handleToggleStatus(product.id, product.isActive)}
                      disabled={toggleProductStatusMutation.isPending}
                    >
                      {product.isActive ? <Pause className="w-4 h-4 ml-1" /> : <Play className="w-4 h-4 ml-1" />}
                      {product.isActive ? 'إيقاف' : 'نشر'}
                    </Button>
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-4">لم يتم العثور على منتجات تطابق معايير البحث</p>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => setLocation("/add-product")}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}