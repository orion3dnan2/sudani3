import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sun, Bell, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-teal-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg mr-3">
              SD
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">البيت</h1>
              <p className="text-xs text-gray-500">سوق وخدمات السودان</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden lg:flex items-center space-x-reverse space-x-6">
            <Link href="/" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              🏠 الرئيسية
            </Link>
            <Link href="/market" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/market' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              🛒 السوق
            </Link>
            <Link href="/stores" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/stores' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              🏪 المتاجر
            </Link>
            <Link href="/jobs" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/jobs' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              💼 الوظائف
            </Link>
            <Link href="/restaurants" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/restaurants' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              🍽️ المطاعم
            </Link>
            <Link href="/services" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/services' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              🔧 الخدمات
            </Link>
            <Link href="/ads" className={`text-sm font-medium transition-colors px-3 py-2 rounded-full ${location === '/ads' ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
              📢 إعلانات
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="أبحث في البيت السوداني..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-reverse space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-reverse space-x-2">
                  <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
                  <User className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
                  <span className="text-sm text-gray-600">{user?.fullName}</span>
                </div>
                {user?.role === 'merchant' || user?.role === 'admin' ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      لوحة التحكم
                    </Button>
                  </Link>
                ) : null}
                <Button onClick={handleLogout} variant="outline" size="sm">
                  خروج
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                  دخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
