import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sun, Bell, User, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center space-x-reverse space-x-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">ب</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">البيت السوداني</h1>
              <p className="text-xs text-gray-500">سوق وخدمات السودان</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden lg:flex items-center space-x-reverse space-x-1">
            <Link
              href="/"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              الرئيسية
            </Link>
            <Link
              href="/market"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/market" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              السوق
            </Link>
            <Link
              href="/stores"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/stores" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              المتاجر
            </Link>
            <Link
              href="/jobs"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/jobs" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              الوظائف
            </Link>
            <Link
              href="/restaurants"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/restaurants" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              المطاعم
            </Link>
            <Link
              href="/services"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/services" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              الخدمات
            </Link>
            <Link
              href="/ads"
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${location === "/ads" ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              إعلانات
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="ابحث..."
                className="w-full pr-4 pl-10 py-2 bg-gray-50 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-reverse space-x-2 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-reverse space-x-2">
                  <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" />
                  <div className="flex items-center space-x-reverse space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="hidden md:block text-sm text-gray-600 max-w-20 truncate">
                      {user?.fullName}
                    </span>
                  </div>
                </div>
                {user?.role === "admin" ? (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      لوحة الإدارة
                    </Button>
                  </Link>
                ) : user?.role === "merchant" ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 sm:px-6 py-2">
                  دخول
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                href="/market"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/market" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                السوق
              </Link>
              <Link
                href="/stores"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/stores" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                المتاجر
              </Link>
              <Link
                href="/jobs"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/jobs" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                الوظائف
              </Link>
              <Link
                href="/restaurants"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/restaurants" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                المطاعم
              </Link>
              <Link
                href="/services"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/services" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                الخدمات
              </Link>
              <Link
                href="/ads"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location === "/ads" ? "text-white bg-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                إعلانات
              </Link>
              
              {/* Mobile Search */}
              <div className="pt-3 pb-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ابحث..."
                    className="w-full pr-4 pl-10 py-2 bg-gray-50 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Mobile User Actions */}
              {isAuthenticated && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                        لوحة إدارة النظام
                      </Button>
                    </Link>
                  )}
                  {user?.role === "merchant" && (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                        لوحة تحكم المتجر
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
