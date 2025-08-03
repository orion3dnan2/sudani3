import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Currency mapping based on country
const countryCurrencyMap: Record<string, { code: string; symbol: string; name: string }> = {
  "السعودية": { code: "SAR", symbol: "ر.س", name: "ريال سعودي" },
  "الكويت": { code: "KWD", symbol: "د.ك", name: "دينار كويتي" },
  "الإمارات": { code: "AED", symbol: "د.إ", name: "درهم إماراتي" },
  "قطر": { code: "QAR", symbol: "ر.ق", name: "ريال قطري" },
  "البحرين": { code: "BHD", symbol: "د.ب", name: "دينار بحريني" },
  "عمان": { code: "OMR", symbol: "ر.ع", name: "ريال عماني" },
  "السودان": { code: "SDG", symbol: "ج.س", name: "جنيه سوداني" },
  "مصر": { code: "EGP", symbol: "ج.م", name: "جنيه مصري" },
  "الأردن": { code: "JOD", symbol: "د.أ", name: "دينار أردني" },
  "default": { code: "USD", symbol: "$", name: "دولار أمريكي" }
};

const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  description: z.string().min(10, "وصف المنتج يجب أن يكون 10 أحرف على الأقل"),
  price: z.number().min(0.01, "السعر يجب أن يكون أكبر من 0"),
  category: z.string().min(1, "الفئة مطلوبة"),
  stock: z.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  specifications: z.string().optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProduct() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [currency, setCurrency] = useState(countryCurrencyMap.default);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0,
      stock: 0,
      weight: 0,
    },
  });

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'merchant')) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Get user's store to determine currency
  const { data: stores } = useQuery({
    queryKey: ["/api/stores/owner", user?.id],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (stores && Array.isArray(stores) && stores.length > 0 && user?.city) {
      // Use city as a proxy for country/region
      const storeCurrency = countryCurrencyMap[user.city] || countryCurrencyMap.default;
      setCurrency(storeCurrency);
    }
  }, [stores, user?.city]);

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('فشل في إضافة المنتج');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/user"] });
      setLocation("/products-management");
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

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
            </div>
            <h1 className="text-xl font-bold text-gray-900">إضافة منتج جديد</h1>
            <div className="flex items-center space-x-reverse space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/products-management")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 ml-1" />
                العودة
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📝 المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="حلويات">حلويات</SelectItem>
                      <SelectItem value="عطور">عطور</SelectItem>
                      <SelectItem value="بخور">بخور</SelectItem>
                      <SelectItem value="ملابس">ملابس</SelectItem>
                      <SelectItem value="إكسسوارات">إكسسوارات</SelectItem>
                      <SelectItem value="أطعمة">أطعمة</SelectItem>
                      <SelectItem value="مشروبات">مشروبات</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    placeholder="مثال: عطر صندل سوداني أصلي"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">وصف المنتج *</Label>
                <Textarea
                  id="description"
                  placeholder="وصف تفصيلي للمنتج يتضمن خصائصه ومميزاته"
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                💰 الأسعار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">السعر الأساسي *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...register("price", { valueAsNumber: true })}
                      className="pr-16"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      {currency.symbol}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">العملة: {currency.name}</p>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stock">الكمية المتوفرة</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    {...register("stock", { valueAsNumber: true })}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📸 صور المنتج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-600">اختر صور المنتج</span>
                  <span className="text-xs text-gray-500">PNG, JPG, WEBP (حد أقصى 5 صور)</span>
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping & Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📦 الشحن والأبعاد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="weight">الوزن (كجم)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.5"
                    {...register("weight", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="dimensions">الأبعاد (سم)</Label>
                  <Input
                    id="dimensions"
                    placeholder="20x15x10"
                    {...register("dimensions")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                ⚙️ التفاصيل والمواصفات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="specifications">المواصفات التقنية</Label>
                <Textarea
                  id="specifications"
                  placeholder="مثال: مصنوع من مواد طبيعية، مقاوم للماء"
                  rows={3}
                  {...register("specifications")}
                />
              </div>

              <div>
                <Label htmlFor="tags">كلمات مفتاحية</Label>
                <Input
                  id="tags"
                  placeholder="مثال: عطر، صندل، سوداني، طبيعي"
                  {...register("tags")}
                />
                <p className="text-xs text-gray-500 mt-1">فصل بين الكلمات بفاصلة لتحسين البحث</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/products-management")}
            >
              إلغاء
            </Button>
            <div className="flex space-x-reverse space-x-4">
              <Button
                type="button"
                variant="outline"
                className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
              >
                حفظ كمسودة
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? "جاري النشر..." : "نشر المنتج"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}