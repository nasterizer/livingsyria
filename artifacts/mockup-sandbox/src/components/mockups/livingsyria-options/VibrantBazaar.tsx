import React from "react";
import { Search, MapPin, Heart, Clock, ChevronLeft, Menu, User, PlusCircle, Car, Home, Briefcase, Smartphone, Wrench, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function VibrantBazaar() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#E11D48] selection:text-white pb-20 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-arabic { font-family: 'IBM Plex Sans Arabic', 'Inter', sans-serif; }
        .font-english { font-family: 'Inter', sans-serif; }
        
        .bazaar-gradient { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
        .bazaar-accent-gradient { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
        .bazaar-pink-gradient { background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .masonry-grid {
          column-count: 2;
          column-gap: 1rem;
        }
        @media (min-width: 768px) {
          .masonry-grid { column-count: 3; }
        }
        @media (min-width: 1024px) {
          .masonry-grid { column-count: 4; }
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
        }
      `}} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden text-emerald-700">
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex flex-col">
              <span className="font-arabic font-bold text-2xl tracking-tight text-emerald-700 leading-none">ليفينغ سوريا</span>
              <span className="font-english text-[10px] font-bold text-slate-400 uppercase tracking-wider">LivingSyria</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl relative group">
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <Input 
              placeholder="ابحث عن سيارات، شقق، وظائف أو أخبار..." 
              className="w-full h-12 ps-12 pe-32 rounded-full border-slate-200 bg-slate-100 focus-visible:ring-emerald-500 font-arabic text-base"
            />
            <div className="absolute inset-y-1 end-1">
              <Button className="h-10 rounded-full bazaar-accent-gradient hover:opacity-90 border-0 px-6 font-arabic font-semibold shadow-md shadow-amber-500/20 text-white">
                بحث
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden md:flex items-center justify-center px-3 py-1.5 rounded-full bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
              <span className="font-arabic">EN</span>
              <span className="mx-1.5 text-slate-300">|</span>
              <span className="font-english text-emerald-600">AR</span>
            </button>
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 text-emerald-700 hover:bg-emerald-50">
              <User className="w-5 h-5" />
            </Button>
            <Button className="hidden sm:flex rounded-full bazaar-gradient hover:opacity-90 shadow-lg shadow-emerald-600/20 font-arabic font-bold px-6 h-11 gap-2 text-white">
              <PlusCircle className="w-5 h-5" />
              أضف إعلانك
            </Button>
          </div>
        </div>
      </header>

      <main className="font-arabic">
        {/* Hero Section */}
        <section className="relative pt-8 pb-12 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="bg-emerald-900 rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden shadow-2xl shadow-emerald-900/20 flex flex-col md:flex-row items-center gap-8 min-h-[400px]">
              
              {/* Background Decorative Blobs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/3 translate-y-1/3"></div>

              <div className="relative z-10 flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-50">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-sm font-medium">نبض الشارع السوري، لحظة بلحظة</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  كل ما يهمك في <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-300 to-amber-500">
                    سوريا اليوم
                  </span>
                </h1>
                
                <p className="text-emerald-100 text-lg md:text-xl max-w-lg leading-relaxed">
                  اكتشف أحدث الأخبار، تصفح الإعلانات المبوبة، وكن جزءاً من المجتمع السوري المتصل.
                </p>

                <div className="flex flex-wrap gap-3 pt-4">
                  <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <span className="text-2xl font-bold text-amber-400">12,400+</span>
                    <span className="text-xs text-emerald-100">إعلان نشط</span>
                  </div>
                  <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <span className="text-2xl font-bold text-amber-400">320+</span>
                    <span className="text-xs text-emerald-100">مدينة ومنطقة</span>
                  </div>
                  <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <span className="text-2xl font-bold text-amber-400">AI</span>
                    <span className="text-xs text-emerald-100">أخبار ملخصة</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-full md:w-5/12 h-64 md:h-[350px]">
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src="/__mockup/images/hero-vibrant.png" alt="Syria Lifestyle" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -left-6 bottom-12 bg-white rounded-2xl p-3 shadow-xl transform -rotate-6 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">تم بيع شقة</div>
                      <div className="font-bold text-slate-800">في دمشق، المزة</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Rail */}
        <section className="mb-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              اكتشف الأقسام
            </h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 snap-x">
              {[
                { icon: Car, name: "سيارات", color: "bg-blue-500", count: "3.2k+" },
                { icon: Home, name: "عقارات", color: "bg-emerald-500", count: "5.1k+" },
                { icon: Briefcase, name: "وظائف", color: "bg-purple-500", count: "1.8k+" },
                { icon: Smartphone, name: "إلكترونيات", color: "bg-amber-500", count: "4.5k+" },
                { icon: Wrench, name: "خدمات", color: "bg-rose-500", count: "2.1k+" },
                { icon: Newspaper, name: "أخبار", color: "bg-indigo-500", count: "جديد" },
              ].map((cat, i) => (
                <div key={i} className="snap-start shrink-0 w-32 h-40 rounded-3xl relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`absolute inset-0 ${cat.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-white">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <cat.icon className="w-7 h-7" />
                    </div>
                    <span className="font-bold text-lg">{cat.name}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-2 font-english">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured News */}
        <section className="mb-14">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  أخبار تهمك
                </h2>
                <p className="text-slate-500 text-sm mt-1">ملخصات ذكية لأهم الأحداث اليوم</p>
              </div>
              <Button variant="link" className="text-emerald-600 font-bold hover:text-emerald-700">عرض الكل <ChevronLeft className="w-4 h-4 ml-1" /></Button>
            </div>

            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4 snap-x">
              {[
                { title: "إطلاق خدمة الدفع الإلكتروني الجديدة في المؤسسات الحكومية لتسهيل المعاملات", img: "/__mockup/images/news-1.png", tag: "اقتصاد", time: "قبل ساعتين", source: "سانا", ai: "يختصر وقت المعاملات بنسبة 60%" },
                { title: "افتتاح جسر جديد في وسط دمشق يخفف الازدحام المروري في أوقات الذروة", img: "/__mockup/images/news-2.png", tag: "إعمار", time: "قبل 4 ساعات", source: "الوطن", ai: "يوفر 30 دقيقة يومياً للركاب" },
                { title: "المنتخب الوطني يحقق فوزاً مهماً في التصفيات الآسيوية وسط حضور جماهيري كبير", img: "/__mockup/images/news-3.png", tag: "رياضة", time: "قبل 5 ساعات", source: "الرياضية", ai: "الفوز الأول منذ عامين" },
              ].map((news, i) => (
                <div key={i} className="snap-start shrink-0 w-[300px] sm:w-[380px] bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-4">
                    <img src={news.img} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-white/90 text-slate-800 hover:bg-white border-0 font-bold backdrop-blur-sm">{news.tag}</Badge>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{news.source}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {news.time}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {news.title}
                    </h3>
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100/50 flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-english font-black text-amber-600">AI</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-snug">{news.ai}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classifieds Masonry */}
        <section className="mb-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">أحدث الإعلانات</h2>
            
            <div className="masonry-grid">
              {[
                { title: "شقة مفروشة إكساء سوبر ديلوكس، إطلالة رائعة", price: "250,000,000", currency: "ل.س", city: "دمشق", img: "/__mockup/images/class-1.png", tag: "عقارات", aspect: "aspect-[3/4]" },
                { title: "كيا ريو 2010 نظيفة جداً خالية العلام", price: "8,500", currency: "$", city: "حلب", img: "/__mockup/images/class-2.png", tag: "سيارات", aspect: "aspect-square" },
                { title: "آيفون 13 برو ماكس ذاكرة 256 جيجا", price: "14,000,000", currency: "ل.س", city: "حمص", img: "/__mockup/images/class-3.png", tag: "إلكترونيات", aspect: "aspect-[4/5]" },
                { title: "مكتب تجاري للإيجار في مركز المدينة", price: "2,000,000", currency: "ل.س / شهر", city: "اللاذقية", img: "/__mockup/images/class-4.png", tag: "عقارات", aspect: "aspect-square" },
                { title: "سجادة عجمية شغل يدوي ألوان زاهية", price: "5,000,000", currency: "ل.س", city: "دمشق", img: "/__mockup/images/class-5.png", tag: "أثاث", aspect: "aspect-[3/4]" },
                { title: "كاميرا كانون احترافية مع عدستين", price: "600", currency: "$", city: "طرطوس", img: "/__mockup/images/class-6.png", tag: "إلكترونيات", aspect: "aspect-square" },
              ].map((item, i) => (
                <div key={i} className="masonry-item bg-white rounded-3xl p-2 shadow-sm border border-slate-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                  <button className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all">
                    <Heart className="w-5 h-5" />
                  </button>
                  <div className={`relative w-full ${item.aspect} rounded-[1.5rem] overflow-hidden mb-3 bg-slate-100`}>
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-black/60 text-white border-0 backdrop-blur-md px-2 py-1">{item.tag}</Badge>
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {item.city}
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="inline-flex items-baseline bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <span className="font-english font-bold text-emerald-700 text-lg mr-1">{item.price}</span>
                      <span className="text-xs font-bold text-emerald-600">{item.currency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-8 h-12 font-bold shadow-xl shadow-slate-900/10">
                تحميل المزيد
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-100/60 pt-16 pb-8 border-t-[12px] border-emerald-500 rounded-t-[3rem] font-arabic mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex flex-col mb-4">
                <span className="font-arabic font-bold text-3xl text-white">ليفينغ سوريا</span>
                <span className="font-english text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">LivingSyria</span>
              </div>
              <p className="text-emerald-100/80 leading-relaxed max-w-sm mb-6 text-sm">
                منصتك اليومية الشاملة لكل ما يهمك في سوريا. بيع، اشتري، واقرأ أهم الأخبار في مكان واحد مصمم خصيصاً لك.
              </p>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 hover:bg-emerald-800 cursor-pointer transition-colors">
                  <span className="font-english font-bold">FB</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 hover:bg-emerald-800 cursor-pointer transition-colors">
                  <span className="font-english font-bold">IG</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 hover:bg-emerald-800 cursor-pointer transition-colors">
                  <span className="font-english font-bold">X</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">المنتج</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">تصفح الإعلانات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">أخبار اليوم</a></li>
                <li><a href="#" className="hover:text-white transition-colors">أضف إعلاناً</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسعار والباقات</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">الشركة</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-900/50 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-emerald-100/40">
            <p>© {new Date().getFullYear()} ليفينغ سوريا. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4 mt-4 md:mt-0 font-english">
              <span>Made with ❤️ for Syria</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
