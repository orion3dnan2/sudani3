export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
            <div className="space-y-2 text-gray-300">
              <p>info@bayt-sudani.com</p>
              <p>البريد الإلكتروني</p>
              <p>+966 123 456 789</p>
              <p>الهاتف</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">الأعمال</h3>
            <div className="space-y-2 text-gray-300">
              <p>شركات</p>
              <p>متاجر</p>
              <p>الإعلانات</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">الخدمات</h3>
            <div className="space-y-2 text-gray-300">
              <p>السوق</p>
              <p>الوظائف</p>
              <p>الخدمات</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">البيت السوداني</h3>
            <p className="text-gray-300 mb-4">منصة خدمات وتجارات سودانية في الخليج والعالم</p>
            <p className="text-xs text-gray-400">© 2024 البيت السوداني. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
