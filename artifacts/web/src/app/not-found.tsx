import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">الصفحة غير موجودة / Page not found</p>
          <Link
            href="/ar"
            className="inline-block px-6 py-3 bg-emerald-700 text-white rounded-full font-medium hover:bg-emerald-800 transition-colors"
          >
            العودة للرئيسية / Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
