import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Warehouse, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

const storageShippingSchema = z.object({
  // Storage Settings
  warehouseAddress: z.string().min(1, "عنوان المستودع مطلوب"),
  storageCapacity: z.string().min(1, "سعة التخزين مطلوبة"),
  inventoryManagement: z.boolean().default(true),
  lowStockAlert: z.string().min(1, "حد تنبيه نفاد المخزون مطلوب"),
  
  // Shipping Settings
  shippingEnabled: z.boolean().default(true),
  freeShippingThreshold: z.string().optional(),
  defaultShippingCost: z.string().min(1, "تكلفة الشحن الافتراضية مطلوبة"),
  estimatedDeliveryDays: z.string().min(1, "أيام التوصيل المتوقعة مطلوبة"),
  
  // Coverage Areas
  coverageAreas: z.array(z.string()).min(1, "يجب تحديد منطقة تغطية واحدة على الأقل"),
  
  // Return Policy
  returnsEnabled: z.boolean().default(true),
  returnPeriodDays: z.string().min(1, "فترة الإرجاع بالأيام مطلوبة"),
  returnConditions: z.string().min(10, "شروط الإرجاع يجب أن تكون 10 أحرف على الأقل"),
});

type StorageShippingFormData = z.infer<typeof storageShippingSchema>;

const coverageAreaOptions = [
  { id: "riyadh", label: "الرياض" },
  { id: "jeddah", label: "جدة" },
  { id: "dammam", label: "الدمام" },
  { id: "mecca", label: "مكة المكرمة" },
  { id: "medina", label: "المدينة المنورة" },
  { id: "khobar", label: "الخبر" },
  { id: "taif", label: "الطائف" },
  { id: "buraidah", label: "بريدة" },
  { id: "tabuk", label: "تبوك" },
  { id: "hail", label: "حائل" },
  { id: "abha", label: "أبها" },
  { id: "khamis", label: "خميس مشيط" },
];

const shippingCompanies = [
  { id: "aramex", name: "أرامكس", cost: "15", days: "2-3" },
  { id: "dhl", name: "DHL", cost: "25", days: "1-2" },
  { id: "fedex", name: "فيدكس", cost: "30", days: "1-2" },
  { id: "smsa", name: "سمسا", cost: "12", days: "3-4" },
  { id: "zajil", name: "زاجل", cost: "10", days: "4-5" },
];

export default function StorageShipping() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedShippingCompanies, setSelectedShippingCompanies] = useState<string[]>([]);
  const [customShippingRates, setCustomShippingRates] = useState<{[key: string]: string}>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<StorageShippingFormData>({
    resolver: zodResolver(storageShippingSchema),
    defaultValues: {
      warehouseAddress: "",
      storageCapacity: "",
      inventoryManagement: true,
      lowStockAlert: "10",
      shippingEnabled: true,
      freeShippingThreshold: "100",
      defaultShippingCost: "15",
      estimatedDeliveryDays: "3",
      coverageAreas: [],
      returnsEnabled: true,
      returnPeriodDays: "14",
      returnConditions: "",
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

  // Load store shipping data into form
  useEffect(() => {
    if (stores && Array.isArray(stores) && stores.length > 0) {
      const store = stores[0];
      const shipping = store.settings?.shipping || {};
      const storage = store.settings?.storage || {};
      
      reset({
        warehouseAddress: storage.warehouseAddress || "",
        storageCapacity: storage.storageCapacity || "",
        inventoryManagement: storage.inventoryManagement ?? true,
        lowStockAlert: storage.lowStockAlert || "10",
        shippingEnabled: shipping.shippingEnabled ?? true,
        freeShippingThreshold: shipping.freeShippingThreshold || "100",
        defaultShippingCost: shipping.defaultShippingCost || "15",
        estimatedDeliveryDays: shipping.estimatedDeliveryDays || "3",
        coverageAreas: shipping.coverageAreas || [],
        returnsEnabled: shipping.returnsEnabled ?? true,
        returnPeriodDays: shipping.returnPeriodDays || "14",
        returnConditions: shipping.returnConditions || "",
      });
      
      setSelectedAreas(shipping.coverageAreas || []);
      setSelectedShippingCompanies(shipping.shippingCompanies || []);
      setCustomShippingRates(shipping.customShippingRates || {});
    }
  }, [stores, reset]);

  // Update store shipping settings mutation
  const updateShippingMutation = useMutation({
    mutationFn: async (data: StorageShippingFormData) => {
      if (!stores || !Array.isArray(stores) || stores.length === 0) {
        throw new Error('لا يوجد متجر للتحديث');
      }

      const response = await fetch(`/api/stores/${stores[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            ...stores[0].settings,
            shipping: {
              shippingEnabled: data.shippingEnabled,
              freeShippingThreshold: data.freeShippingThreshold,
              defaultShippingCost: data.defaultShippingCost,
              estimatedDeliveryDays: data.estimatedDeliveryDays,
              coverageAreas: data.coverageAreas,
              returnsEnabled: data.returnsEnabled,
              returnPeriodDays: data.returnPeriodDays,
              returnConditions: data.returnConditions,
              shippingCompanies: selectedShippingCompanies,
              customShippingRates: customShippingRates,
            },
            storage: {
              warehouseAddress: data.warehouseAddress,
              storageCapacity: data.storageCapacity,
              inventoryManagement: data.inventoryManagement,
              lowStockAlert: data.lowStockAlert,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث إعدادات التخزين والتوصيل');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores/owner"] });
      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث إعدادات التخزين والتوصيل بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "فشل في تحديث إعدادات التخزين والتوصيل",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StorageShippingFormData) => {
    updateShippingMutation.mutate({ ...data, coverageAreas: selectedAreas });
  };

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreas(prev => {
      const newAreas = prev.includes(areaId) 
        ? prev.filter(a => a !== areaId)
        : [...prev, areaId];
      setValue("coverageAreas", newAreas);
      return newAreas;
    });
  };

  const handleShippingCompanyToggle = (companyId: string) => {
    setSelectedShippingCompanies(prev => {
      return prev.includes(companyId) 
        ? prev.filter(c => c !== companyId)
        : [...prev, companyId];
    });
  };

  const handleCustomRateChange = (companyId: string, rate: string) => {
    setCustomShippingRates(prev => ({
      ...prev,
      [companyId]: rate
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Package className="w-4 h-4 ml-2" />
                التخزين والتوصيل
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة التخزين والتوصيل</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/store-settings")}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              رجوع لإعدادات المتجر
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Storage Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Warehouse className="w-5 h-5 ml-2 text-blue-600" />
                إدارة المخزون والتخزين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="warehouseAddress">عنوان المستودع</Label>
                  <Input
                    id="warehouseAddress"
                    placeholder="الرياض، حي الصناعية، شارع الملك فهد"
                    {...register("warehouseAddress")}
                  />
                  {errors.warehouseAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.warehouseAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="storageCapacity">السعة التخزينية</Label>
                  <Input
                    id="storageCapacity"
                    placeholder="1000 قطعة"
                    {...register("storageCapacity")}
                  />
                  {errors.storageCapacity && (
                    <p className="text-red-500 text-sm mt-1">{errors.storageCapacity.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">إدارة المخزون التلقائية</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      تتبع المخزون تلقائياً وإرسال تنبيهات عند نفاد المخزون
                    </p>
                  </div>
                  <Switch
                    checked={watch("inventoryManagement")}
                    onCheckedChange={(checked) => setValue("inventoryManagement", checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="lowStockAlert">حد تنبيه نفاد المخزون</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    placeholder="10"
                    {...register("lowStockAlert")}
                  />
                  <p className="text-xs text-gray-500 mt-1">عدد القطع التي عندها يتم إرسال تنبيه</p>
                  {errors.lowStockAlert && (
                    <p className="text-red-500 text-sm mt-1">{errors.lowStockAlert.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 ml-2 text-green-600" />
                إعدادات الشحن والتوصيل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div>
                  <Label className="text-base font-medium">تفعيل خدمة الشحن</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    السماح للعملاء بطلب الشحن والتوصيل
                  </p>
                </div>
                <Switch
                  checked={watch("shippingEnabled")}
                  onCheckedChange={(checked) => setValue("shippingEnabled", checked)}
                />
              </div>

              {watch("shippingEnabled") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="defaultShippingCost">تكلفة الشحن الافتراضية (ريال)</Label>
                      <Input
                        id="defaultShippingCost"
                        type="number"
                        placeholder="15"
                        {...register("defaultShippingCost")}
                      />
                      {errors.defaultShippingCost && (
                        <p className="text-red-500 text-sm mt-1">{errors.defaultShippingCost.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="freeShippingThreshold">الشحن المجاني من (ريال)</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        placeholder="100"
                        {...register("freeShippingThreshold")}
                      />
                      <p className="text-xs text-gray-500 mt-1">اتركها فارغة لعدم التفعيل</p>
                    </div>

                    <div>
                      <Label htmlFor="estimatedDeliveryDays">أيام التوصيل المتوقعة</Label>
                      <Input
                        id="estimatedDeliveryDays"
                        type="number"
                        placeholder="3"
                        {...register("estimatedDeliveryDays")}
                      />
                      {errors.estimatedDeliveryDays && (
                        <p className="text-red-500 text-sm mt-1">{errors.estimatedDeliveryDays.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Coverage Areas */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">مناطق التغطية</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {coverageAreaOptions.map((area) => (
                        <div key={area.id} className="flex items-center space-x-reverse space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={area.id}
                            checked={selectedAreas.includes(area.id)}
                            onCheckedChange={() => handleAreaToggle(area.id)}
                          />
                          <Label htmlFor={area.id} className="text-sm cursor-pointer">
                            {area.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.coverageAreas && (
                      <p className="text-red-500 text-sm mt-2">{errors.coverageAreas.message}</p>
                    )}
                  </div>

                  {/* Shipping Companies */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">شركات الشحن المفضلة</Label>
                    <div className="space-y-3">
                      {shippingCompanies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-reverse space-x-3">
                            <Checkbox
                              id={company.id}
                              checked={selectedShippingCompanies.includes(company.id)}
                              onCheckedChange={() => handleShippingCompanyToggle(company.id)}
                            />
                            <div>
                              <Label htmlFor={company.id} className="font-medium cursor-pointer">
                                {company.name}
                              </Label>
                              <p className="text-sm text-gray-600">
                                التكلفة الافتراضية: {company.cost} ريال - التوصيل: {company.days} أيام
                              </p>
                            </div>
                          </div>
                          {selectedShippingCompanies.includes(company.id) && (
                            <div className="flex items-center space-x-reverse space-x-2">
                              <Label className="text-sm">تكلفة مخصصة:</Label>
                              <Input
                                type="number"
                                placeholder={company.cost}
                                className="w-20"
                                value={customShippingRates[company.id] || ''}
                                onChange={(e) => handleCustomRateChange(company.id, e.target.value)}
                              />
                              <span className="text-sm text-gray-500">ريال</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Return Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowLeft className="w-5 h-5 ml-2 text-orange-600" />
                سياسة الإرجاع والاستبدال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                <div>
                  <Label className="text-base font-medium">تفعيل خدمة الإرجاع</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    السماح للعملاء بإرجاع واستبدال المنتجات
                  </p>
                </div>
                <Switch
                  checked={watch("returnsEnabled")}
                  onCheckedChange={(checked) => setValue("returnsEnabled", checked)}
                />
              </div>

              {watch("returnsEnabled") && (
                <>
                  <div>
                    <Label htmlFor="returnPeriodDays">فترة الإرجاع (بالأيام)</Label>
                    <Input
                      id="returnPeriodDays"
                      type="number"
                      placeholder="14"
                      {...register("returnPeriodDays")}
                    />
                    <p className="text-xs text-gray-500 mt-1">عدد الأيام المسموح فيها لإرجاع المنتج</p>
                    {errors.returnPeriodDays && (
                      <p className="text-red-500 text-sm mt-1">{errors.returnPeriodDays.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="returnConditions">شروط وأحكام الإرجاع</Label>
                    <Textarea
                      id="returnConditions"
                      placeholder="• المنتج يجب أن يكون في حالته الأصلية&#10;• عدم استخدام المنتج&#10;• توفير فاتورة الشراء&#10;• تحمل العميل تكلفة الإرجاع"
                      rows={6}
                      {...register("returnConditions")}
                    />
                    {errors.returnConditions && (
                      <p className="text-red-500 text-sm mt-1">{errors.returnConditions.message}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Info className="w-5 h-5 ml-2" />
                ملخص الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">التخزين</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>إدارة المخزون:</span>
                      <Badge variant={watch("inventoryManagement") ? "default" : "secondary"}>
                        {watch("inventoryManagement") ? "مفعل" : "معطل"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>تنبيه نفاد المخزون:</span>
                      <span>{watch("lowStockAlert")} قطعة</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">الشحن</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>خدمة الشحن:</span>
                      <Badge variant={watch("shippingEnabled") ? "default" : "secondary"}>
                        {watch("shippingEnabled") ? "مفعلة" : "معطلة"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>التكلفة الافتراضية:</span>
                      <span>{watch("defaultShippingCost")} ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مناطق التغطية:</span>
                      <span>{selectedAreas.length} منطقة</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الإرجاع:</span>
                      <Badge variant={watch("returnsEnabled") ? "default" : "secondary"}>
                        {watch("returnsEnabled") ? "مفعل" : "معطل"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-reverse space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/store-settings")}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
              disabled={updateShippingMutation.isPending}
            >
              {updateShippingMutation.isPending ? (
                <>
                  <Settings className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ إعدادات التخزين والتوصيل
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}