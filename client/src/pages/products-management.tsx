import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft, Eye, Edit, Trash2, List, Grid3X3, Search, Package } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

export default function ProductsManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'merchant')) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Fetch products for the current user
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/user", user?.id],
    enabled: !!user?.id,
  });

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                إعادة تعيين المنتجات
              </Button>
              <span className="text-sm text-gray-500">رؤل أقلامي</span>
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
              <h3 className="font-medium text-blue-900">منتجات متجر رؤل أقلامي</h3>
              <p className="text-sm text-blue-700">
                متجرك لديك في السوق العام للبيع • يمكن للمشترين رؤية وشراء منتجاتك
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
                  <SelectValue placeholder="الأحدث أولاً" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الأحدث أولاً</SelectItem>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="غير نشط">غير نشط</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="غير نشط">غير نشط</SelectItem>
                  <SelectItem value="نفد المخزون">نفد المخزون</SelectItem>
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
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    نشط
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
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
                      <Badge className="bg-green-500 text-white">نشط</Badge>
                      <span className="text-sm text-gray-500">{product.stock || 50} قطعة</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}