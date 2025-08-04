
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Store, 
  Phone, 
  Filter,
  Grid3X3,
  List,
  ChevronLeft
} from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isActive: boolean;
  settings?: {
    category?: string;
    address?: string;
    openTime?: string;
    closeTime?: string;
    workingDays?: string[];
  };
  createdAt: string;
  owner: {
    fullName: string;
    city: string;
    phone?: string;
  };
}

const storeCategories = [
  { value: "all", label: "جميع الفئات" },
  { value: "food-fragrance", label: "أطعمة وعطور" },
  { value: "clothing", label: "ملابس وأزياء" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "home-garden", label: "منزل وحديقة" },
  { value: "health-beauty", label: "صحة وجمال" },
  { value: "sports", label: "رياضة ولياقة" },
  { value: "books-education", label: "كتب وتعليم" },
  { value: "automotive", label: "سيارات ومركبات" },
  { value: "handmade", label: "منتجات يدوية" },
];

const sudaneseCities = [
  { value: "all", label: "جميع المدن" },
  { value: "الخرطوم", label: "الخرطوم" },
  { value: "بحري", label: "بحري" },
  { value: "أم درمان", label: "أم درمان" },
  { value: "بورتسودان", label: "بورتسودان" },
  { value: "كسلا", label: "كسلا" },
  { value: "القضارف", label: "القضارف" },
  { value: "مدني", label: "مدني" },
  { value: "عطبرة", label: "عطبرة" },
  { value: "نيالا", label: "نيالا" },
  { value: "الفاشر", label: "الفاشر" },
];

const workingDaysMap = {
  sunday: "الأحد",
  monday: "الاثنين", 
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
};

export default function Stores() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch stores with filters
  const { data: stores = [], isLoading } = useQuery<StoreData[]>({
    queryKey: ["/api/stores", { category: categoryFilter, search: searchQuery, city: cityFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (cityFilter !== "all") params.append("city", cityFilter);

      const response = await fetch(`/api/stores?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    },
  });

  const getCategoryLabel = (category?: string) => {
    return storeCategories.find(cat => cat.value === category)?.label || "غير محدد";
  };

  const formatWorkingHours = (openTime?: string, closeTime?: string) => {
    if (!openTime || !closeTime) return "غير محدد";
    return `${openTime} - ${closeTime}`;
  };

  const formatWorkingDays = (workingDays?: string[]) => {
    if (!workingDays || workingDays.length === 0) return "غير محدد";
    return workingDays.map(day => workingDaysMap[day as keyof typeof workingDaysMap] || day).join("، ");
  };

  const handleStoreClick = (storeId: string) => {
    setLocation(`/store/${storeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">متاجر السوق</h1>
              <p className="text-gray-600 mt-1">اكتشف أفضل المتاجر السودانية</p>
            </div>
            <div className="text-sm text-gray-500">
              {stores.length} متجر متوفر
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث في المتاجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {storeCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {sudaneseCities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-reverse space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                <Grid3X3 className="w-4 h-4 ml-1" />
                شبكة
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                <List className="w-4 h-4 ml-1" />
                قائمة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">جاري تحميل المتاجر...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-bold text-gray-500 mb-4">لا توجد متاجر</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              لم نتمكن من العثور على متاجر تطابق معايير البحث الخاصة بك. جرب تعديل الفلاتر.
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {stores.map((store) => (
              <Card 
                key={store.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === "list" ? "flex" : ""
                }`}
                onClick={() => handleStoreClick(store.id)}
              >
                {viewMode === "grid" ? (
                  <>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                            {store.name}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 ml-1" />
                            {store.owner.city}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(store.settings?.category)}
                          </Badge>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {store.name.charAt(0)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {store.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 ml-1" />
                          <span>ساعات العمل: {formatWorkingHours(store.settings?.openTime, store.settings?.closeTime)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Store className="w-3 h-3 ml-1" />
                          <span>المالك: {store.owner.fullName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm text-gray-600 mr-1">5.0</span>
                        </div>
                        <Button size="sm" className="text-xs">
                          زيارة المتجر
                          <ChevronLeft className="w-3 h-3 mr-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex w-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl m-4">
                      {store.name.charAt(0)}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{store.name}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{store.description}</p>
                          
                          <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 ml-1" />
                              {store.owner.city}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(store.settings?.category)}
                            </Badge>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 ml-1" />
                              {formatWorkingHours(store.settings?.openTime, store.settings?.closeTime)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-left">
                          <div className="flex items-center text-yellow-500 mb-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm text-gray-600 mr-1">5.0</span>
                          </div>
                          <Button size="sm" className="text-xs">
                            زيارة المتجر
                            <ChevronLeft className="w-3 h-3 mr-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
