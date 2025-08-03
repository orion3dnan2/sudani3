import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-primary-blue text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold text-sm">
              SD
            </div>
            <div className="mr-3">
              <h1 className="text-lg font-bold text-gray-900">القفة السودانية</h1>
              <p className="text-xs text-gray-500">سوق وخدمات سودانية</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-reverse space-x-8">
            <Link href="/" className={`transition-colors ${location === '/' ? 'text-primary-blue' : 'text-gray-700 hover:text-primary-blue'}`}>
              الرئيسية
            </Link>
            <Link href="/market" className={`transition-colors ${location === '/market' ? 'text-primary-blue' : 'text-gray-700 hover:text-primary-blue'}`}>
              السوق
            </Link>
            <Link href="/services" className={`transition-colors ${location === '/services' ? 'text-primary-blue' : 'text-gray-700 hover:text-primary-blue'}`}>
              الخدمات
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-reverse space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">مرحباً، {user?.fullName}</span>
                {user?.role === 'merchant' || user?.role === 'admin' ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      لوحة التحكم
                    </Button>
                  </Link>
                ) : null}
                <Button onClick={handleLogout} variant="outline" size="sm">
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-primary-blue hover:bg-blue-600">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="border-primary-blue text-primary-blue hover:bg-blue-50">
                    حساب جديد
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
