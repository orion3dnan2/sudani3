import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, BellRing, Star } from "lucide-react";

export default function Services() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">خدماتنا</h1>
          <p className="text-gray-600">مجموعة شاملة من الخدمات المتخصصة التي تخدم المجتمع السوداني</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Job Board */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="bg-purple-accent text-white rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">لوحة الوظائف</h3>
              <p className="text-gray-600 mb-6">ابحث عن فرص عمل مناسبة أو أعلن عن وظائف شاغرة</p>
              <Button className="bg-purple-accent hover:bg-purple-700">
                ← اكتشف المزيد
              </Button>
            </CardContent>
          </Card>

          {/* Premium Services */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="bg-warning-orange text-white rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">الخدمات المميزة</h3>
              <p className="text-gray-600 mb-6">احصل على خدمات مميزة ومتخصصة من خبراء سودانيين</p>
              <Button className="bg-warning-orange hover:bg-orange-600">
                ← اكتشف المزيد
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Advertisements */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="bg-error-red text-white rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                <BellRing className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">الإعلانات</h3>
              <p className="text-gray-600 mb-6">روج لأعمالك وخدماتك للمجتمع السوداني</p>
              <Button className="bg-error-red hover:bg-red-600">
                ← اكتشف المزيد
              </Button>
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">آراء العملاء</h3>
              <p className="text-gray-600 mb-6">ماذا يقول عملاؤنا عن خدماتنا</p>
              
              <Card className="bg-white mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="text-yellow-400 text-lg">
                      ⭐ ⭐ ⭐ ⭐ ⭐
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">"البيت السوداني ساعدني في الوصول لعملاء جدد ومنصة تجارية ممتازة"</p>
                  <div className="flex items-center">
                    <div className="bg-primary-blue text-white rounded-full w-8 h-8 flex items-center justify-center ml-3">
                      أ
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">أحمد محمد</div>
                      <div className="text-sm text-gray-600">صاحب متجر</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
