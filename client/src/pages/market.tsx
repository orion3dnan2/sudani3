import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search } from "lucide-react";
import { Link } from "wouter";

export default function Market() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-primary-blue text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">السوق التجاري</h1>
          <p className="text-gray-600">اكتشف أفضل المنتجات السودانية في الخليج والعالم</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث في المنتجات..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="food">منتجات غذائية</SelectItem>
                  <SelectItem value="textiles">منسوجات</SelectItem>
                  <SelectItem value="handicrafts">حرف يدوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="text-gray-300 mb-6">
            <Store className="w-24 h-24 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-500 mb-4">قريباً...</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            نعمل على تقديم أفضل المنتجات السودانية المتميزة للعضو المتميز على أحدث المنتجات
          </p>
          <Link href="/register">
            <Button className="bg-primary-blue hover:bg-blue-600">
              ← هل تريد البيع على الموقع؟
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
