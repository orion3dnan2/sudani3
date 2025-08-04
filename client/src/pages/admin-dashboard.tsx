import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  Eye,
  UserPlus,
  Wrench,
  Heart,
  LogOut,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  totalRevenue: string;
  totalStores: number;
  activeStores: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  route?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Mock admin stats - in real app would come from API
  const adminStats: AdminStats = {
    totalRevenue: "135.17",
    totalStores: 3456,
    activeStores: 89,
    totalUsers: 1247,
    totalOrders: 0,
    pendingOrders: 0
  };

  const quickActions: QuickAction[] = [
    {
      id: "stores",
      title: "إدارة المتاجر",
      description: "مراجعة وإدارة جميع المتاجر في المنصة",
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      route: "/admin/stores"
    },
    {
      id: "users",
      title: "إدارة المستخدمين",
      description: "إدارة المستخدمين والصلاحيات",
      icon: Users,
      color: "text-green-600", 
      bgColor: "bg-green-50",
      route: "/admin/users"
    },
    {
      id: "orders",
      title: "إعدادات الطلبات",
      description: "متابعة وإدارة جميع الطلبات",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      route: "/admin/orders"
    },
    {
      id: "content",
      title: "إدارة المحتوى",
      description: "إدارة محتوى الموقع والصفحات",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      route: "/admin/content"
    },
    {
      id: "settings",
      title: "إعدادات التطبيق",
      description: "تخصيص إعدادات المنصة العامة",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      route: "/admin/settings"
    },
    {
      id: "analytics",
      title: "التطوير والتحليلات", 
      description: "مراجعة واعتماد المتاجر الجديدة",
      icon: Store,
      color: "text-red-600",
      bgColor: "bg-red-50",
      route: "/admin/stores"
    },
    {
      id: "users",
      title: "إدارة المستخدمين",
      description: "حماية وتعديل وحذف المستخدمين والتطبيقات",
      icon: Users,
      color: "text-green-600", 
      bgColor: "bg-green-50",
      route: "/admin/users"
    },
    {
      id: "settings",
      title: "إعدادات التطبيق",
      description: "إدارة الإعدادات العامة والتفضيلات الأساسية",
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      route: "/admin/settings"
    },
    {
      id: "content",
      title: "إدارة المحتوى",
      description: "إدارة المحتوى والتصنيفات المختلفة",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      route: "/admin/content"
    },
    {
      id: "orders", 
      title: "إعدادات الطلبات",
      description: "إعدادات الدفع والشحن والضرائب الضريبية",
      icon: ShoppingCart,
      color: "text-red-600",
      bgColor: "bg-red-50", 
      route: "/admin/orders"
    },
    {
      id: "analytics",
      title: "التطوير والتحليلات",
      description: "تحسين أداء وتحليل بيانات المنصة",
      icon: TrendingUp,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      route: "/admin/analytics"
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "المتاجر ❤️ الاشتراك",
      description: "تسجيل متجر جديد",
      time: "منذ 15 دقيقة",
      icon: Store,
      color: "text-blue-600"
    },
    {
      id: "2", 
      type: "طلب اعتماد متجر",
      description: "يرتاسة شاب فشوت مع فيديو 90 دقيقة",
      time: "منذ 30 دقيقة",
      icon: Eye,
      color: "text-green-600"
    },
    {
      id: "3",
      type: "مراجعة سريعة",
      description: "في تسليف تحديد في مدة ستين",
      time: "منذ ساعتين",
      icon: Heart,
      color: "text-pink-600"
    },
    {
      id: "4",
      type: "طلب دعم فني",
      description: "يرتبط عضوية إشت في تحديد محدد",
      time: "منذ ساعتين",
      icon: Wrench,
      color: "text-yellow-600"
    }
  ];

  const quickStats = [
    {
      id: "17",
      title: "المتاجر 🔎 الاشتراك",
      description: "إحصائيات سريعة",
      color: "text-blue-600"
    },
    {
      id: "12", 
      title: "طلبات الاعتماد",
      description: "",
      color: "text-orange-600"
    },
    {
      id: "33",
      title: "تقييمات جديدة", 
      description: "",
      color: "text-green-600"
    },
    {
      id: "893",
      title: "إجمالي الطلبات",
      description: "",
      color: "text-purple-600"
    }
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                O
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-sm text-gray-500">أهلاً وسهلاً مدير التطبيق</span>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 ml-1" />
                خروج
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 ml-1" />
                عرض الموقع
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg sm:text-2xl font-bold text-orange-800">{adminStats.totalRevenue} ر.س</p>
                  <p className="text-xs sm:text-sm text-orange-600">الإيرادات السنوية</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg sm:text-2xl font-bold text-purple-800">{adminStats.totalStores}</p>
                  <p className="text-xs sm:text-sm text-purple-600">إجمالي المتاجر</p>
                </div>
                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg sm:text-2xl font-bold text-green-800">{adminStats.activeStores}</p>
                  <p className="text-xs sm:text-sm text-green-600">المتاجر النشطة</p>
                </div>
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-lg sm:text-2xl font-bold text-blue-800">{adminStats.totalUsers}</p>
                  <p className="text-xs sm:text-sm text-blue-600">إجمالي المستخدمين</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">🔧 الإجراءات السريعة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => (
              <Card key={action.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-reverse space-x-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{action.description}</p>
                      <Button 
                        onClick={() => action.route && setLocation(action.route)}
                        size="sm" 
                        className="w-full sm:w-auto"
                      >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        الانتقال
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📊 إحصائيات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-3">
                    <span className={`text-2xl font-bold ${stat.color}`}>{stat.id}</span>
                    <span className="text-sm text-gray-600">{stat.title}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                عرض التقارير التفصيلية
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🕒 الأنشطة الحديثة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-reverse space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-reverse space-x-2 mb-1">
                      <span className="font-medium text-sm">{activity.type}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                عرض جميع الأنشطة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}