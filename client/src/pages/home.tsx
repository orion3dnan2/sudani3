import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Mail, ClipboardList, Users, Briefcase, Store, BellRing, Star } from "lucide-react";
import backgroundImage from "@assets/image_1754214186296.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-96 flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative text-center text-white z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">القفة السودانية</h1>
            <p className="text-lg md:text-xl mb-8">سوق وخدمات وتجارات السودان في الخليج والعالم</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/market">
                <Button className="bg-primary-blue hover:bg-blue-600 px-6 py-3">
                  المتجر الآن
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3">
                المزيد ←
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">+2K</div>
                <div className="text-sm text-gray-600">شركة عضو</div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">+50K</div>
                <div className="text-sm text-gray-600">طلب منجز</div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">+5K</div>
                <div className="text-sm text-gray-600">خدمة مسجلة</div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">+100K</div>
                <div className="text-sm text-gray-600">مستخدم نشط</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">خدماتنا</h2>
            <p className="text-gray-600">مجموعة شاملة من الخدمات المتخصصة التي تخدم المجتمع السوداني في الخليج والعالم</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Job Board Service */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">لوحة الوظائف</h3>
                <p className="text-gray-600 mb-4">ابحث عن فرص عمل مناسبة أو أعلن عن وظائف شاغرة</p>
                <Button className="w-full bg-purple-accent hover:bg-purple-700">
                  ← اكتشف المزيد
                </Button>
              </CardContent>
            </Card>

            {/* Company Directory */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <Building className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">دليل الشركات</h3>
                <p className="text-gray-600 mb-4">تصفح دليل الشركات والمؤسسات السودانية في الخليج</p>
                <Button className="w-full bg-success-green hover:bg-green-600">
                  ← اكتشف المزيد
                </Button>
              </CardContent>
            </Card>

            {/* Marketplace */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <Store className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">السوق التجاري</h3>
                <p className="text-gray-600 mb-4">اكتشف منتجات سودانية أصيلة من موردين موثوقين</p>
                <Link href="/market">
                  <Button className="w-full bg-primary-blue hover:bg-blue-600">
                    ← اكتشف المزيد
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Advertisements */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-red-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <BellRing className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">الإعلانات</h3>
                <p className="text-gray-600 mb-4">روج لأعمالك وخدماتك للمجتمع السوداني</p>
                <Button className="w-full bg-error-red hover:bg-red-600">
                  ← اكتشف المزيد
                </Button>
              </CardContent>
            </Card>

            {/* Premium Services */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">الخدمات المميزة</h3>
                <p className="text-gray-600 mb-4">احصل على خدمات مميزة ومتخصصة من خبراء سودانيين</p>
                <Button className="w-full bg-warning-orange hover:bg-orange-600">
                  ← اكتشف المزيد
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
