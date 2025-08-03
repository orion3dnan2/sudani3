import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Store, Package, ShoppingBag, MapPin, Phone, Mail, Clock, Settings, Upload, Image } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

const storeSettingsSchema = z.object({
  name: z.string().min(1, "اسم المتجر مطلوب"),
  description: z.string().min(10, "وصف المتجر يجب أن يكون 10 أحرف على الأقل"),
  category: z.string().min(1, "فئة المتجر مطلوبة"),
  address: z.string().min(1, "عنوان المتجر مطلوب"),
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      address: "",
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
    if (stores && Array.isArray(stores) && stores.length > 0) {
      const store = stores[0];
      reset({
        name: store.name || "",
        description: store.description || "",
        category: store.settings?.category || "",
        address: store.settings?.address || "",
        openTime: store.settings?.openTime || "09:00",
        closeTime: store.settings?.closeTime || "22:00",
        workingDays: store.settings?.workingDays || [],
      });
      setSelectedDays(store.settings?.workingDays || []);
      
      // Set select values programmatically
      if (store.settings?.category) {
        setValue("category", store.settings.category);
      }
    }
  }, [stores, reset]);

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (data: StoreSettingsFormData) => {
      if (!stores || !Array.isArray(stores) || stores.length === 0) {
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
            address: data.address,
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
      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث إعدادات المتجر بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "فشل في تحديث إعدادات المتجر",
        variant: "destructive",
      });
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

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "تم تحديد الشعار",
        description: "سيتم حفظ الشعار عند حفظ التغييرات",
      });
    }
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "تم تحديد الغلاف",
        description: "سيتم حفظ الغلاف عند حفظ التغييرات",
      });
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
                رجوع
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
                      <Label htmlFor="storeLogo">شعار المتجر</Label>
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="شعار المتجر" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => logoInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 ml-1" />
                            تغيير الشعار
                          </Button>
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="storeCover">غلاف المتجر</Label>
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                          {coverPreview ? (
                            <img src={coverPreview} alt="غلاف المتجر" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => coverInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 ml-1" />
                            تغيير الغلاف
                          </Button>
                          <input
                            type="file"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
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

                  {/* User Information - Read Only */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">معلومات الاتصال (من بيانات المستخدم)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">رقم الهاتف</Label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md text-sm flex items-center">
                          <Phone className="w-4 h-4 ml-2 text-gray-500" />
                          {user?.phone || "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">البريد الإلكتروني</Label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md text-sm flex items-center">
                          <Mail className="w-4 h-4 ml-2 text-gray-500" />
                          {user?.email || "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">الدولة/المدينة</Label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md text-sm flex items-center">
                          <MapPin className="w-4 h-4 ml-2 text-gray-500" />
                          {user?.city && user?.country ? `${user.city} - ${user.country}` : "غير محدد"}
                        </div>
                      </div>
                    </div>
                    {(!user?.phone || !user?.country) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">
                          💡 لتحديث معلومات الاتصال، قم بتسجيل الخروج ثم تسجيل الدخول مرة أخرى لتحديث البيانات
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">عنوان المتجر التفصيلي</Label>
                    <Input
                      id="address"
                      placeholder="شارع المملكة، حي الخالدية، المبنى رقم 123"
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
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