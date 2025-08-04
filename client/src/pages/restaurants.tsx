import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Clock, Star, Truck, DollarSign } from "lucide-react";
import type { Restaurant } from "@shared/schema";

export default function Restaurants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCuisine = selectedCuisine === "all" || restaurant.cuisine === selectedCuisine;
    
    return matchesSearch && matchesCuisine;
  });

  const cuisineTypes = [...new Set(restaurants.map(r => r.cuisine))];

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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🍽️ المطاعم</h1>
            <p className="text-xl text-white/90 mb-8">
              اكتشف أفضل المطاعم السودانية والعربية
            </p>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن المطاعم أو نوع الطبخ..."
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCuisine === "all" ? "default" : "outline"}
              onClick={() => setSelectedCuisine("all")}
              className="rounded-full"
            >
              جميع الأنواع
            </Button>
            {cuisineTypes.map((cuisine) => (
              <Button
                key={cuisine}
                variant={selectedCuisine === cuisine ? "default" : "outline"}
                onClick={() => setSelectedCuisine(cuisine)}
                className="rounded-full"
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-600">
          تم العثور على {filteredRestaurants.length} مطعم
        </p>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لم يتم العثور على مطاعم
            </h3>
            <p className="text-gray-600">
              جرب البحث بكلمات مختلفة أو اختر نوع طبخ آخر
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Restaurant Image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  
                  {/* Cuisine Badge */}
                  <Badge className="absolute top-3 right-3 bg-orange-600 hover:bg-orange-700">
                    {restaurant.cuisine}
                  </Badge>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Restaurant Name & Description */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {restaurant.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{restaurant.address}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 mb-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{restaurant.phone}</span>
                  </div>

                  {/* Opening Hours */}
                  {restaurant.openHours && (
                    <div className="flex items-center gap-2 mb-3 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{restaurant.openHours}</span>
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>التوصيل: {restaurant.deliveryPrice} ريال</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>أقل طلب: {restaurant.minOrderAmount} ريال</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => {
                      // Navigate to restaurant details or order page
                      console.log('Navigate to restaurant:', restaurant.id);
                    }}
                  >
                    عرض المطعم
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}