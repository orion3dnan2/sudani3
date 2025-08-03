import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });
      
      const data = await response.json();
      login(data.user);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${data.user.fullName}`,
      });
      
      // Redirect based on user role
      if (data.user.role === 'admin' || data.user.role === 'merchant') {
        setLocation("/dashboard");
      } else {
        setLocation("/");
      }
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى التحقق من البيانات والمحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="bg-primary-blue text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
            <p className="text-gray-600">أدخل بياناتك لتسجيل دخولك</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username">اسم المستخدم ✉️</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور 🔒</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">تذكرني</Label>
                </div>
                <a href="#" className="text-sm text-primary-blue hover:text-blue-600">نسيت كلمة المرور؟</a>
              </div>

              <Button type="submit" className="w-full bg-primary-blue hover:bg-blue-600" disabled={isLoading}>
                {isLoading ? "جاري تسجيل الدخول..." : "→ تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-primary-blue hover:text-blue-600 font-medium">
                  أنشئ حساب جديد
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">حسابات التجربة</h3>
            <div className="space-y-3">
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">مدير التطبيق (Super Admin)</div>
                      <div className="text-sm text-gray-600 flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">admin</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">⭐⭐⭐ 5 من 5</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDemoLogin("admin", "admin123")}
                    >
                      تجربة
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">صاحب متجر (Merchant)</div>
                      <div className="text-sm text-gray-600 flex gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">merchant</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">صاحب المتجر</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDemoLogin("merchant", "merchant123")}
                    >
                      تجربة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
