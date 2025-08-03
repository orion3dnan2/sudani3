import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Store, Package, ShoppingBag, MapPin, Phone, Mail, Clock, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const storeSettingsSchema = z.object({
  name: z.string().min(1, "اسم المتجر مطلوب"),
  description: z.string().min(10, "وصف المتجر يجب أن يكون 10 أحرف على الأقل"),
  category: z.string().min(1, "فئة المتجر مطلوبة"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  address: z.string().min(1, "عنوان المتجر مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة"),
  openTime: z.string().min(1, "وقت الفتح مطلوب"),
  closeTime: z.string().min(1, "وقت الإغلاق مطلوب"),
  workingDays: z.array(z.string()).min(1, "يجب اختيار يوم عمل واحد على الأقل"),
});

type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

const workingDaysOptions = [
  { id: "sunday", label: "السبت" },
  { id: "monday", label: "الأحد" },
  { id: "tuesday", label: "الاثنين" },
  { id: "wednesday", label: "الثلاثاء" },
  { id: "thursday", label: "الأربعاء" },
  { id: "friday", label: "الخميس" },
  { id: "saturday", label: "الجمعة" },
];

export default function StoreSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      openTime: "09:00",
      closeTime: "22:00",
      workingDays: [],
    },
  });

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'merchant')) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Get user's store
  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ["/api/stores/owner", user?.id],
    enabled: !!user?.id,
  });

  // Load store data into form
  useEffect(() => {
    if (stores && stores.length > 0) {
      const store = stores[0];
      reset({
        name: store.name || "",
        description: store.description || "",
        category: store.settings?.category || "",
        email: store.settings?.email || "",
        phone: store.settings?.phone || "",
        address: store.settings?.address || "",
        city: store.settings?.city || "",
        openTime: store.settings?.openTime || "09:00",
        closeTime: store.settings?.closeTime || "22:00",
        workingDays: store.settings?.workingDays || [],
      });
      setSelectedDays(store.settings?.workingDays || []);
    }
  }, [stores, reset]);

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (data: StoreSettingsFormData) => {
      if (!stores || stores.length === 0) {
        throw new Error('لا يوجد متجر للتحديث');
      }

      const response = await fetch(`/api/stores/${stores[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          settings: {
            category: data.category,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            openTime: data.openTime,
            closeTime: data.closeTime,
            workingDays: data.workingDays,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث إعدادات المتجر');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores/owner"] });
    },
  });

  const onSubmit = (data: StoreSettingsFormData) => {
    updateStoreMutation.mutate({ ...data, workingDays: selectedDays });
  };

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId];
      setValue("workingDays", newDays);
      return newDays;
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Settings className="w-4 h-4 ml-2" />
                إعدادات المتجر
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">إعدادات المتجر</h1>
            <div className="flex items-center space-x-reverse space-x-2">
              <span className="text-sm text-gray-500">حفظ</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 ml-1" />
                common.back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">معلومات المتجر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-reverse space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Store className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">الإشعارات</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Package className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">التخزين والتوصيل</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <ShoppingBag className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">احتساب والأمان</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    📝 معلومات المتجر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="storeName">شعار المتجر</Label>
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm">
                          تغيير الشعار
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="packageIcon">غلاف المتجر</Label>
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm">
                          تغيير الغلاف
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">اسم المتجر</Label>
                      <Input
                        id="name"
                        placeholder="مثال: الدار السوداني"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">فئة المتجر</Label>
                      <Select onValueChange={(value) => setValue("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="حدائق غذائية وعطور" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">مطعم</SelectItem>
                          <SelectItem value="shipping">شركة شحن</SelectItem>
                          <SelectItem value="travel">شركة سفر وسياحة</SelectItem>
                          <SelectItem value="clothing">محلات ملابس</SelectItem>
                          <SelectItem value="perfumes">محلات عطور</SelectItem>
                          <SelectItem value="food-fragrance">حدائق غذائية وعطور</SelectItem>
                          <SelectItem value="electronics">إلكترونيات</SelectItem>
                          <SelectItem value="home">منزل وحديقة</SelectItem>
                          <SelectItem value="books">كتب وقرطاسية</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">وصف المتجر</Label>
                    <Textarea
                      id="description"
                      placeholder="متجر متخصص في بيع المنتجات السودانية الأصيلة والحديثة من غذائية وعطارية وعود بأنواعها بجودة عالية"
                      rows={4}
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        placeholder="+966501234567"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="store@baknair-sudani.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="address">عنوان المتجر</Label>
                      <Input
                        id="address"
                        placeholder="شارع المملكة، حي الخالدية"
                        {...register("address")}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city">المدينة</Label>
                      <Select onValueChange={(value) => setValue("city", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="الرياض - المملكة العربية السعودية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="riyadh">الرياض - المملكة العربية السعودية</SelectItem>
                          <SelectItem value="jeddah">جدة - المملكة العربية السعودية</SelectItem>
                          <SelectItem value="kuwait">الكويت - دولة الكويت</SelectItem>
                          <SelectItem value="dubai">دبي - دولة الإمارات العربية المتحدة</SelectItem>
                          <SelectItem value="doha">الدوحة - دولة قطر</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    🕒 ساعات العمل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="openTime">من الساعة</Label>
                      <Input
                        id="openTime"
                        type="time"
                        {...register("openTime")}
                      />
                      {errors.openTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.openTime.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="closeTime">إلى الساعة</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        {...register("closeTime")}
                      />
                      {errors.closeTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.closeTime.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>أيام العمل</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {workingDaysOptions.map((day) => (
                        <div key={day.id} className="flex items-center space-x-reverse space-x-2">
                          <Checkbox
                            id={day.id}
                            checked={selectedDays.includes(day.id)}
                            onCheckedChange={() => handleDayToggle(day.id)}
                          />
                          <Label htmlFor={day.id} className="text-sm">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.workingDays && (
                      <p className="text-red-500 text-sm mt-1">{errors.workingDays.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8"
                  disabled={updateStoreMutation.isPending}
                >
                  {updateStoreMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}