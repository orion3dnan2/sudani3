import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Mail, DollarSign, Calendar, Star, Image as ImageIcon } from "lucide-react";
import type { Ad } from "@shared/schema";

export default function Ads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: ads = [], isLoading } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
  });

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || ad.category === selectedCategory;
    const matchesType = selectedType === "all" || ad.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(ads.map(a => a.category))];
  const adTypes = [...new Set(ads.map(a => a.type))];

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "sale": "للبيع",
      "rent": "للإيجار",
      "wanted": "مطلوب",
      "service": "خدمة"
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "sale": "bg-green-100 text-green-800 hover:bg-green-200",
      "rent": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "wanted": "bg-orange-100 text-orange-800 hover:bg-orange-200",
      "service": "bg-purple-100 text-purple-800 hover:bg-purple-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const formatPrice = (price: string | null) => {
    if (!price || price === "0.00") return null;
    return `${parseFloat(price).toLocaleString()} ريال`;
  };

  const formatExpiryDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">📢 إعلانات</h1>
            <p className="text-xl text-white/90 mb-8">
              اعثر على ما تبحث عنه أو أعلن عما تريد بيعه
            </p>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث في الإعلانات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-12 py-3 rounded-full text-lg bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">الفئات</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full"
                  size="sm"
                >
                  جميع الفئات
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">نوع الإعلان</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  onClick={() => setSelectedType("all")}
                  className="rounded-full"
                  size="sm"
                >
                  جميع الأنواع
                </Button>
                {adTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                    className="rounded-full"
                    size="sm"
                  >
                    {getTypeLabel(type)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-600">
          تم العثور على {filteredAds.length} إعلان
        </p>
      </div>

      {/* Ads Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredAds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لم يتم العثور على إعلانات
            </h3>
            <p className="text-gray-600">
              جرب البحث بكلمات مختلفة أو اختر فئة أخرى
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Ad Image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {ad.images && ad.images.length > 0 ? (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100 ${ad.images && ad.images.length > 0 ? 'hidden' : ''}`}>
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  
                  {/* Category Badge */}
                  <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700">
                    {ad.category}
                  </Badge>
                  
                  {/* Type Badge */}
                  <Badge className={`absolute top-3 left-3 ${getTypeColor(ad.type)}`}>
                    {getTypeLabel(ad.type)}
                  </Badge>

                  {/* Premium Badge */}
                  {ad.isPremium && (
                    <div className="absolute bottom-3 right-3 bg-yellow-500 text-white rounded-full px-2 py-1 flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span>مميز</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Ad Title & Description */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {ad.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {ad.description}
                    </p>
                  </div>

                  {/* Price */}
                  {formatPrice(ad.price) && (
                    <div className="flex items-center gap-2 mb-3 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg font-bold">{formatPrice(ad.price)}</span>
                    </div>
                  )}

                  {/* Location */}
                  {ad.location && (
                    <div className="flex items-center gap-2 mb-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{ad.location}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">{ad.contactName}</span>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{ad.contactPhone}</span>
                      </div>
                    </div>

                    {ad.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>{ad.contactEmail}</span>
                      </div>
                    )}

                    {/* Expiry Date */}
                    {ad.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>ينتهي في: {formatExpiryDate(ad.expiresAt)}</span>
                      </div>
                    )}

                    {/* Contact Button */}
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        // Create contact message based on ad type
                        const subject = `استفسار عن ${ad.title}`;
                        const body = `السلام عليكم،%0D%0A%0D%0Aأرغب في الاستفسار عن إعلانكم: ${ad.title}%0D%0A%0D%0Aشكراً لكم`;
                        
                        if (ad.contactEmail) {
                          window.location.href = `mailto:${ad.contactEmail}?subject=${subject}&body=${body}`;
                        } else {
                          // Fallback to phone
                          window.location.href = `tel:${ad.contactPhone}`;
                        }
                      }}
                    >
                      تواصل مع المعلن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}