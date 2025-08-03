import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, User, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    country: "",
    city: "",
    role: "customer",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await apiRequest("POST", "/api/auth/register", userData);
      
      const data = await response.json();
      login(data.user);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً بك ${data.user.fullName}`,
      });
      
      setLocation("/");
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "يرجى التحقق من البيانات والمحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="bg-primary-blue text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
            <p className="text-gray-600">انضم إلى منصة التسوق الإلكتروني</p>
          </CardHeader>
          <CardContent>
            {/* User Type Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium">نوع الحساب 📝</Label>
              <RadioGroup 
                value={formData.role} 
                onValueChange={(value) => handleInputChange("role", value)}
                className="space-y-3 mt-3"
              >
                <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="customer" id="customer" />
                  <div className="bg-blue-100 text-blue-600 rounded-lg w-8 h-8 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="customer" className="font-medium cursor-pointer">مستخدم عادي</Label>
                    <p className="text-sm text-gray-600">للتسوق والاستفادة من الخدمات المختلفة</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="merchant" id="merchant" />
                  <div className="bg-green-100 text-green-600 rounded-lg w-8 h-8 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="merchant" className="font-medium cursor-pointer">صاحب عمل</Label>
                    <p className="text-sm text-gray-600">لإنشاء متجر وبيع المنتجات</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني 📧</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">الاسم الكامل 👤</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="أدخل الاسم الكامل"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="اختر اسم مستخدم فريد"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">الدولة 🌍</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="السعودية">السعودية</SelectItem>
                      <SelectItem value="الإمارات">الإمارات</SelectItem>
                      <SelectItem value="الكويت">الكويت</SelectItem>
                      <SelectItem value="قطر">قطر</SelectItem>
                      <SelectItem value="البحرين">البحرين</SelectItem>
                      <SelectItem value="عمان">عمان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف 📱</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+966 50 123 4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">المدينة 🏙️</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="أدخل اسم المدينة"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">كلمة المرور 🔒</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور 🔒</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="أدخل كلمة المرور مرة أخرى"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">أوافق على الشروط والأحكام</Label>
                </div>
                <div className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox id="commercial" />
                  <Label htmlFor="commercial" className="text-sm">أوافق على الشروط التجارية والعمولات الخاصة</Label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary-blue hover:bg-blue-600" disabled={isLoading}>
                {isLoading ? "جاري إنشاء الحساب..." : "→ إنشاء الحساب"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-primary-blue hover:text-blue-600 font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
