import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Eye, Edit, Trash2, Plus, Image, Video, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: "page" | "post" | "banner" | "announcement";
  status: "published" | "draft" | "archived";
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaItem {
  id: string;
  filename: string;
  type: "image" | "video" | "document";
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("content");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: content = [], isLoading: isContentLoading } = useQuery({
    queryKey: ["/api/admin/content"],
    queryFn: async () => {
      const response = await fetch("/api/admin/content");
      if (!response.ok) throw new Error("Failed to fetch content");
      return response.json();
    }
  });

  const { data: media = [], isLoading: isMediaLoading } = useQuery({
    queryKey: ["/api/admin/media"],
    queryFn: async () => {
      const response = await fetch("/api/admin/media");
      if (!response.ok) throw new Error("Failed to fetch media");
      return response.json();
    }
  });

  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const response = await apiRequest("POST", "/api/admin/content", contentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "تم إنشاء المحتوى بنجاح" });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ في إنشاء المحتوى", variant: "destructive" });
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ contentId, updates }: { contentId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/content/${contentId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "تم تحديث المحتوى بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في تحديث المحتوى", variant: "destructive" });
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/content/${contentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "تم حذف المحتوى بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ في حذف المحتوى", variant: "destructive" });
    }
  });

  const filteredContent = content.filter((item: ContentItem) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteContent = (contentId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      deleteContentMutation.mutate(contentId);
    }
  };

  const handleStatusChange = (contentId: string, newStatus: string) => {
    updateContentMutation.mutate({
      contentId,
      updates: { status: newStatus }
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "page": return "صفحة";
      case "post": return "مقال";
      case "banner": return "بانر";
      case "announcement": return "إعلان";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      case "archived": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المحتوى</h1>
          <p className="text-gray-600">إدارة وتنظيم محتوى المنصة والوسائط</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            المحتوى
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            الوسائط
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            الصفحات
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            البانرات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-6">
            {/* Content Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{content.length}</p>
                      <p className="text-sm text-gray-600">إجمالي المحتوى</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{content.filter((c: ContentItem) => c.status === 'published').length}</p>
                      <p className="text-sm text-gray-600">منشور</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Edit className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{content.filter((c: ContentItem) => c.status === 'draft').length}</p>
                      <p className="text-sm text-gray-600">مسودة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-gray-500 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{content.filter((c: ContentItem) => c.type === 'page').length}</p>
                      <p className="text-sm text-gray-600">صفحات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="ابحث في المحتوى..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        <SelectItem value="page">صفحة</SelectItem>
                        <SelectItem value="post">مقال</SelectItem>
                        <SelectItem value="banner">بانر</SelectItem>
                        <SelectItem value="announcement">إعلان</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="published">منشور</SelectItem>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="archived">مؤرشف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة محتوى
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>إضافة محتوى جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">العنوان</Label>
                          <Input id="title" placeholder="عنوان المحتوى" />
                        </div>
                        <div>
                          <Label htmlFor="type">النوع</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع المحتوى" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="page">صفحة</SelectItem>
                              <SelectItem value="post">مقال</SelectItem>
                              <SelectItem value="banner">بانر</SelectItem>
                              <SelectItem value="announcement">إعلان</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="content">المحتوى</Label>
                          <Textarea id="content" placeholder="نص المحتوى" rows={6} />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => createContentMutation.mutate({})}>
                            حفظ كمسودة
                          </Button>
                          <Button variant="outline" onClick={() => createContentMutation.mutate({})}>
                            نشر
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Content Table */}
            <Card>
              <CardHeader>
                <CardTitle>قائمة المحتوى ({filteredContent.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isContentLoading ? (
                  <div className="text-center py-8">جاري التحميل...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>المؤلف</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item: ContentItem) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{getTypeLabel(item.type)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status) as any}>
                              {item.status === "published" ? "منشور" : 
                               item.status === "draft" ? "مسودة" : "مؤرشف"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>
                            {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedContent(item)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>معاينة المحتوى</DialogTitle>
                                  </DialogHeader>
                                  {selectedContent && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label>العنوان</Label>
                                        <p className="text-sm">{selectedContent.title}</p>
                                      </div>
                                      <div>
                                        <Label>المحتوى</Label>
                                        <p className="text-sm">{selectedContent.content}</p>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <Select onValueChange={(value) => handleStatusChange(item.id, value)}>
                                <SelectTrigger className="w-20">
                                  <Edit className="w-4 h-4" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="published">نشر</SelectItem>
                                  <SelectItem value="draft">مسودة</SelectItem>
                                  <SelectItem value="archived">أرشفة</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteContent(item.id)}
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
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>مكتبة الوسائط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">مكتبة الوسائط</h3>
                <p className="text-gray-600 mb-4">قم برفع وإدارة الصور والفيديوهات والملفات</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  رفع ملف
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الصفحات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">صفحات الموقع</h3>
                <p className="text-gray-600 mb-4">إدارة الصفحات الثابتة مثل من نحن وشروط الاستخدام</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة صفحة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>إدارة البانرات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">بانرات الموقع</h3>
                <p className="text-gray-600 mb-4">إدارة البانرات الإعلانية والترويجية</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة بانر
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}