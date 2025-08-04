import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  UserPlus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  Store,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface UserData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم تحديث المستخدم بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المستخدم", variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "تم حذف المستخدم بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المستخدم", variant: "destructive" });
    }
  });

  const filteredUsers = users.filter((user: UserData) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.isActive) ||
                         (filterStatus === "inactive" && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = (user: UserData) => {
    updateUserMutation.mutate({
      userId: user.id,
      updates: { isActive: !user.isActive }
    });
  };

  const handleChangeRole = (user: UserData, newRole: string) => {
    updateUserMutation.mutate({
      userId: user.id,
      updates: { role: newRole }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4 text-red-500" />;
      case "merchant": return <Store className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "مدير";
      case "merchant": return "تاجر";
      case "customer": return "عميل";
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "merchant": return "bg-blue-100 text-blue-800";
      case "customer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const adminUsers = users.filter((u: UserData) => u.role === 'admin').length;
  const merchantUsers = users.filter((u: UserData) => u.role === 'merchant').length;
  const customerUsers = users.filter((u: UserData) => u.role === 'customer').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-reverse space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للوحة الإدارة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600 text-sm">إدارة وتتبع جميع المستخدمين في النظام</p>
          </div>
        </div>
        <div className="flex items-center space-x-reverse space-x-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            النظام
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة مستخدم جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-800">{adminUsers}</p>
                <p className="text-sm text-red-600">المديرين</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-800">{merchantUsers}</p>
                <p className="text-sm text-blue-600">التجار</p>
              </div>
              <Store className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-800">{customerUsers}</p>
                <p className="text-sm text-green-600">المستخدمين العاديين</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-800">{totalUsers}</p>
                <p className="text-sm text-purple-600">إجمالي المستخدمين</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو اسم المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-32">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأدوار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="merchant">تاجر</SelectItem>
                  <SelectItem value="customer">عميل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            قائمة المستخدمين ({filteredUsers.length})
          </h2>
          
          {filteredUsers.map((user: UserData) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* User Info */}
                  <div className="flex items-start space-x-reverse space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-reverse space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge 
                          variant={user.isActive ? "default" : "secondary"}
                          className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {user.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">@{user.username}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{user.city || "غير محدد"}, {user.country || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>انضم في {new Date(user.createdAt).toLocaleDateString("ar-SA")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-reverse space-x-6 text-center">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Store className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-blue-800">
                          {user.role === 'merchant' ? Math.floor(Math.random() * 3) + 1 : 0}
                        </p>
                        <p className="text-xs text-blue-600">متجر</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-lg font-bold text-green-800">
                          {Math.floor(Math.random() * 50) + 5}
                        </p>
                        <p className="text-xs text-green-600">طلب</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-lg font-bold text-purple-800">
                          {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </p>
                        <p className="text-xs text-purple-600">يوم</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    
                    {user.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleToggleStatus(user)}
                      >
                        تعطيل
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleToggleStatus(user)}
                      >
                        تفعيل
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد مستخدمين مطابقين للبحث</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}