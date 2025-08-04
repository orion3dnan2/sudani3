import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Mail, Bell, Shield, Palette, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    supportEmail: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
  };
  features: {
    enableRegistration: boolean;
    enableStoreCreation: boolean;
    enableProductReviews: boolean;
    enableWishlist: boolean;
    enableNotifications: boolean;
    enableChat: boolean;
  };
  payment: {
    currency: string;
    taxRate: number;
    shippingFee: number;
    freeShippingThreshold: number;
    enablePaymentGateway: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    passwordMinLength: number;
    requireEmailVerification: boolean;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    enablePushNotifications: boolean;
    newOrderNotifications: boolean;
    newUserNotifications: boolean;
  };
}

export default function AppSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PUT", "/api/admin/settings", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "تم حفظ الإعدادات بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حفظ الإعدادات", variant: "destructive" });
    }
  });

  const handleSave = (sectionData: any, section: string) => {
    updateSettingsMutation.mutate({ [section]: sectionData });
  };

  if (isLoading) {
    return <div className="p-6 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات التطبيق</h1>
          <p className="text-gray-600">إدارة وتخصيص إعدادات المنصة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            الميزات
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            الدفع
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            الإشعارات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">اسم الموقع</Label>
                  <Input
                    id="siteName"
                    defaultValue={settings?.general?.siteName || "البيت السوداني"}
                    placeholder="اسم الموقع"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">بريد المدير</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    defaultValue={settings?.general?.adminEmail || "admin@bayt-sudani.com"}
                    placeholder="البريد الإلكتروني للمدير"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">وصف الموقع</Label>
                <Textarea
                  id="siteDescription"
                  defaultValue={settings?.general?.siteDescription || "منصة تجارية سودانية"}
                  placeholder="وصف مختصر للموقع"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
                  <Select defaultValue={settings?.general?.defaultLanguage || "ar"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select defaultValue={settings?.general?.timezone || "Asia/Riyadh"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Africa/Khartoum">الخرطوم (GMT+2)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="maintenanceMode"
                  defaultChecked={settings?.general?.maintenanceMode || false}
                />
                <Label htmlFor="maintenanceMode">وضع الصيانة</Label>
              </div>

              <Button 
                onClick={() => handleSave({/* collect form data */}, "general")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                حفظ الإعدادات العامة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الميزات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل التسجيل</Label>
                    <p className="text-sm text-gray-600">السماح للمستخدمين الجدد بإنشاء حسابات</p>
                  </div>
                  <Switch defaultChecked={settings?.features?.enableRegistration ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل إنشاء المتاجر</Label>
                    <p className="text-sm text-gray-600">السماح للمستخدمين بإنشاء متاجرهم</p>
                  </div>
                  <Switch defaultChecked={settings?.features?.enableStoreCreation ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل تقييم المنتجات</Label>
                    <p className="text-sm text-gray-600">السماح للعملاء بتقييم المنتجات</p>
                  </div>
                  <Switch defaultChecked={settings?.features?.enableProductReviews ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل قائمة الأمنيات</Label>
                    <p className="text-sm text-gray-600">السماح للمستخدمين بحفظ المنتجات المفضلة</p>
                  </div>
                  <Switch defaultChecked={settings?.features?.enableWishlist ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل الإشعارات</Label>
                    <p className="text-sm text-gray-600">إرسال إشعارات للمستخدمين</p>
                  </div>
                  <Switch defaultChecked={settings?.features?.enableNotifications ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل المحادثة</Label>
                    <p className="text-sm text-gray-600">تفعيل نظام المحادثة بين البائع والمشتري</p>
                  </div>
                  <Switch defaultChecked={settings?.features?.enableChat ?? false} />
                </div>
              </div>

              <Button 
                onClick={() => handleSave({/* collect form data */}, "features")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                حفظ إعدادات الميزات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Select defaultValue={settings?.payment?.currency || "SAR"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    defaultValue={settings?.payment?.taxRate || 15}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippingFee">رسوم الشحن</Label>
                  <Input
                    id="shippingFee"
                    type="number"
                    defaultValue={settings?.payment?.shippingFee || 20}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="freeShippingThreshold">حد الشحن المجاني</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    defaultValue={settings?.payment?.freeShippingThreshold || 200}
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="enablePaymentGateway"
                  defaultChecked={settings?.payment?.enablePaymentGateway ?? false}
                />
                <Label htmlFor="enablePaymentGateway">تفعيل بوابة الدفع الإلكتروني</Label>
              </div>

              <Button 
                onClick={() => handleSave({/* collect form data */}, "payment")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                حفظ إعدادات الدفع
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">انتهاء صلاحية الجلسة (دقيقة)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    defaultValue={settings?.security?.sessionTimeout || 60}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">عدد محاولات تسجيل الدخول</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    defaultValue={settings?.security?.maxLoginAttempts || 5}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="passwordMinLength">الحد الأدنى لطول كلمة المرور</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  defaultValue={settings?.security?.passwordMinLength || 8}
                  placeholder="8"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="enableTwoFactor"
                    defaultChecked={settings?.security?.enableTwoFactor ?? false}
                  />
                  <Label htmlFor="enableTwoFactor">تفعيل المصادقة الثنائية</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="requireEmailVerification"
                    defaultChecked={settings?.security?.requireEmailVerification ?? true}
                  />
                  <Label htmlFor="requireEmailVerification">طلب تأكيد البريد الإلكتروني</Label>
                </div>
              </div>

              <Button 
                onClick={() => handleSave({/* collect form data */}, "security")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                حفظ إعدادات الأمان
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-gray-600">إرسال الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch defaultChecked={settings?.notifications?.enableEmailNotifications ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات الرسائل النصية</Label>
                    <p className="text-sm text-gray-600">إرسال الإشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch defaultChecked={settings?.notifications?.enableSmsNotifications ?? false} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>الإشعارات الفورية</Label>
                    <p className="text-sm text-gray-600">إرسال إشعارات فورية للمتصفح</p>
                  </div>
                  <Switch defaultChecked={settings?.notifications?.enablePushNotifications ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات الطلبات الجديدة</Label>
                    <p className="text-sm text-gray-600">إشعار المديرين بالطلبات الجديدة</p>
                  </div>
                  <Switch defaultChecked={settings?.notifications?.newOrderNotifications ?? true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات المستخدمين الجدد</Label>
                    <p className="text-sm text-gray-600">إشعار المديرين بالمستخدمين الجدد</p>
                  </div>
                  <Switch defaultChecked={settings?.notifications?.newUserNotifications ?? true} />
                </div>
              </div>

              <Button 
                onClick={() => handleSave({/* collect form data */}, "notifications")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                حفظ إعدادات الإشعارات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}