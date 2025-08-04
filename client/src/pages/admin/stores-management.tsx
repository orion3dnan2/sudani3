import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, Search, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface StoreData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  isActive: boolean;
  settings: any;
  createdAt: string;
  owner: {
    fullName: string;
    city: string;
  };
}

export default function StoresManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const { toast } = useToast();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["/api/admin/stores"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json();
    }
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ storeId, updates }: { storeId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/stores/${storeId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      toast({ title: "تم تحديث المتجر بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المتجر", variant: "destructive" });
    }
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/stores/${storeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      toast({ title: "تم حذف المتجر بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المتجر", variant: "destructive" });
    }
  });

  const filteredStores = stores.filter((store: StoreData) => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && store.isActive) ||
                         (filterStatus === "inactive" && !store.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (store: StoreData) => {
    updateStoreMutation.mutate({
      storeId: store.id,
      updates: { isActive: !store.isActive }
    });
  };

  const handleDeleteStore = (storeId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المتجر؟")) {
      deleteStoreMutation.mutate(storeId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المتاجر</h1>
          <p className="text-gray-600">إدارة وتنظيم جميع المتاجر في المنصة</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Store className="w-4 h-4 mr-2" />
          إضافة متجر جديد
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="ابحث في المتاجر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المتاجر ({filteredStores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المتجر</TableHead>
                  <TableHead>صاحب المتجر</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store: StoreData) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.owner.fullName}</TableCell>
                    <TableCell>{store.owner.city}</TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? "default" : "secondary"}>
                        {store.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(store.createdAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStore(store)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل المتجر</DialogTitle>
                            </DialogHeader>
                            {selectedStore && (
                              <div className="space-y-4">
                                <div>
                                  <Label>اسم المتجر</Label>
                                  <p className="text-sm">{selectedStore.name}</p>
                                </div>
                                <div>
                                  <Label>الوصف</Label>
                                  <p className="text-sm">{selectedStore.description}</p>
                                </div>
                                <div>
                                  <Label>صاحب المتجر</Label>
                                  <p className="text-sm">{selectedStore.owner.fullName}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(store)}
                        >
                          {store.isActive ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStore(store.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}