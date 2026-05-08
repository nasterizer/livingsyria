import React from "react";
import { Search, Globe, User, PlusCircle, ChevronLeft, MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorialSouk() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] text-[#2C312E] font-['Amiri',_serif] selection:bg-[#3C4A3E] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500&display=swap');
        
        .font-en-serif { font-family: 'Cormorant Garamond', serif; }
        .font-en-sans { font-family: 'Inter', sans-serif; }
        .font-ar-serif { font-family: 'Amiri', serif; }
        
        .divider-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l2.5 17.5L40 20l-17.5 2.5L20 40l-2.5-17.5L0 20l17.5-2.5z' fill='%233C4A3E' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Top Strip */}
      <div className="border-b border-[#E5E2D9] py-1.5 px-4 md:px-8 text-xs flex justify-between items-center text-[#5C635A] font-en-sans tracking-wide uppercase bg-[#F9F8F4]">
        <div className="flex items-center gap-4">
          <span className="font-ar-serif text-sm tracking-normal">الجمعة 8 مايو 2026</span>
          <span className="hidden sm:inline-block w-px h-3 bg-[#D5D2C9]"></span>
          <span className="hidden sm:inline-block">Damascus, SYR</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-[#2C312E] transition-colors flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>EN / ع</span>
          </button>
          <span className="w-px h-3 bg-[#D5D2C9]"></span>
          <button className="hover:text-[#2C312E] transition-colors">Sign In</button>
        </div>
      </div>

      {/* Masthead */}
      <header className="py-8 md:py-12 border-b border-[#2C312E] px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-ar-serif font-bold text-[#3C4A3E] mb-2 leading-tight">
          ليفينغ سوريا
        </h1>
        <div className="flex items-center justify-center gap-4 text-[#5C635A]">
          <hr className="w-12 border-[#D5D2C9]" />
          <h2 className="text-xl md:text-2xl font-en-serif tracking-widest uppercase">LivingSyria</h2>
          <hr className="w-12 border-[#D5D2C9]" />
        </div>
        <p className="mt-4 text-[#7A8277] max-w-md mx-auto text-sm font-en-sans uppercase tracking-widest">
          The Daily Chronicle of Levantine Life
        </p>
      </header>

      {/* Navigation & Search */}
      <nav className="border-b border-[#E5E2D9] px-4 md:px-8 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-3 gap-4">
          <ul className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 font-ar-serif text-lg text-[#3C4A3E] whitespace-nowrap scrollbar-hide">
            <li><a href="#" className="hover:text-[#A66D4F] transition-colors font-bold">الرئيسية</a></li>
            <li><a href="#" className="hover:text-[#A66D4F] transition-colors">أخبار</a></li>
            <li><a href="#" className="hover:text-[#A66D4F] transition-colors">عقارات</a></li>
            <li><a href="#" className="hover:text-[#A66D4F] transition-colors">سيارات</a></li>
            <li><a href="#" className="hover:text-[#A66D4F] transition-colors">وظائف</a></li>
            <li><a href="#" className="hover:text-[#A66D4F] transition-colors">دليل الأعمال</a></li>
          </ul>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8277]" />
              <input 
                type="text" 
                placeholder="ابحث في الأخبار أو الإعلانات..." 
                className="w-full bg-[#F4F1EA] border-none rounded-sm py-1.5 pr-9 pl-3 text-sm focus:ring-1 focus:ring-[#3C4A3E] outline-none font-ar-serif"
              />
            </div>
            <Button className="bg-[#3C4A3E] hover:bg-[#2C312E] text-[#FDFBF7] rounded-sm h-8 px-4 font-ar-serif text-base shrink-0 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              أضف إعلانك
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* Featured News Section - NYT Style */}
        <section className="mb-16">
          <div className="flex items-end justify-between border-b-2 border-[#2C312E] pb-2 mb-6">
            <h3 className="text-2xl font-ar-serif font-bold text-[#3C4A3E]">أهم الأخبار</h3>
            <span className="font-en-sans text-xs font-semibold tracking-widest uppercase text-[#A66D4F]">Top Stories</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Lead Story */}
            <article className="lg:col-span-8 flex flex-col group cursor-pointer">
              <div className="aspect-[16/9] w-full overflow-hidden mb-4 rounded-sm">
                <img src="/__mockup/images/ls-news-1.png" alt="Economy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex gap-2 items-center mb-2">
                <span className="bg-[#A66D4F] text-white px-2 py-0.5 text-xs font-en-sans uppercase tracking-wider rounded-sm">Economy</span>
                <span className="text-[#7A8277] text-sm flex items-center gap-1 font-en-sans"><Clock className="w-3 h-3" /> 2 hours ago</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-ar-serif font-bold text-[#2C312E] leading-tight mb-3 group-hover:text-[#A66D4F] transition-colors">
                انتعاش تدريجي في الأسواق المحلية مع بدء الموسم التجاري الجديد في دمشق
              </h2>
              <p className="text-lg text-[#5C635A] font-ar-serif leading-relaxed line-clamp-3">
                شهدت الأسواق المركزية في العاصمة السورية حركة نشطة خلال الأيام القليلة الماضية، حيث توافد المتسوقون تحضيراً للموسم الجديد. ويشير المحللون إلى أن هذه الحركة تعكس تحسناً نسبياً في القوة الشرائية ومرونة الاقتصاد المحلي رغم التحديات.
              </p>
              <div className="mt-4 text-sm font-en-sans uppercase tracking-widest text-[#7A8277] font-semibold border-t border-[#E5E2D9] pt-3 w-max">
                Read Full Story
              </div>
            </article>

            {/* Sidebar Stories */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <article className="group cursor-pointer border-b border-[#E5E2D9] pb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-[#A66D4F] text-[10px] font-en-sans uppercase tracking-wider font-bold">Reconstruction</span>
                    </div>
                    <h4 className="text-xl font-ar-serif font-bold text-[#2C312E] leading-snug mb-2 group-hover:text-[#A66D4F] transition-colors">
                      إعادة تأهيل البنية التحتية في حلب القديمة تدخل مرحلتها الثانية
                    </h4>
                    <p className="text-sm text-[#7A8277] font-ar-serif line-clamp-2">
                      مشاريع واسعة النطاق لترميم الأسواق التاريخية والمرافق العامة بتمويل محلي.
                    </p>
                  </div>
                  <div className="w-24 h-24 shrink-0 overflow-hidden rounded-sm">
                    <img src="/__mockup/images/ls-news-2.png" alt="Reconstruction" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                </div>
              </article>

              <article className="group cursor-pointer border-b border-[#E5E2D9] pb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-[#A66D4F] text-[10px] font-en-sans uppercase tracking-wider font-bold">Culture</span>
                    </div>
                    <h4 className="text-xl font-ar-serif font-bold text-[#2C312E] leading-snug mb-2 group-hover:text-[#A66D4F] transition-colors">
                      مهرجان القلعة الثقافي في حمص يستقطب آلاف الزوار هذا الأسبوع
                    </h4>
                    <p className="text-sm text-[#7A8277] font-ar-serif line-clamp-2">
                      فعاليات فنية وتراثية تسلط الضوء على الغنى الثقافي للمنطقة الوسطى.
                    </p>
                  </div>
                  <div className="w-24 h-24 shrink-0 overflow-hidden rounded-sm">
                    <img src="/__mockup/images/ls-news-3.png" alt="Culture" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                </div>
              </article>

              <article className="group cursor-pointer">
                <div className="flex gap-2 items-center mb-1">
                  <span className="text-[#A66D4F] text-[10px] font-en-sans uppercase tracking-wider font-bold">Tech & Business</span>
                </div>
                <h4 className="text-xl font-ar-serif font-bold text-[#2C312E] leading-snug mb-2 group-hover:text-[#A66D4F] transition-colors">
                  إطلاق منصة جديدة للخدمات الإلكترونية في اللاذقية لتسهيل المعاملات
                </h4>
                <p className="text-sm text-[#7A8277] font-ar-serif">
                  تهدف المبادرة إلى رقمنة أكثر من 50 خدمة أساسية للمواطنين.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="h-16 divider-pattern my-12 opacity-50"></div>

        {/* Categories Rail */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-ar-serif font-bold text-[#3C4A3E]">دليل السوق</h3>
            <button className="text-sm font-en-sans uppercase tracking-widest text-[#7A8277] hover:text-[#2C312E] transition-colors border-b border-transparent hover:border-[#2C312E]">
              View Directory
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['عقارات', 'سيارات', 'إلكترونيات', 'وظائف', 'خدمات', 'أثاث'].map((cat, i) => (
              <div key={i} className="group cursor-pointer border border-[#D5D2C9] hover:border-[#3C4A3E] bg-white p-6 text-center transition-all duration-300 rounded-sm hover:shadow-sm">
                <h4 className="text-2xl font-ar-serif text-[#2C312E] group-hover:text-[#A66D4F] transition-colors">{cat}</h4>
                <div className="mt-3 w-8 h-px bg-[#D5D2C9] mx-auto group-hover:bg-[#A66D4F] transition-colors"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Classifieds Gallery */}
        <section className="mb-20">
          <div className="flex items-end justify-between border-b-2 border-[#2C312E] pb-2 mb-8">
            <h3 className="text-2xl font-ar-serif font-bold text-[#3C4A3E]">الإعلانات المبوبة</h3>
            <span className="font-en-sans text-xs font-semibold tracking-widest uppercase text-[#A66D4F]">Marketplace</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { cat: 'عقارات', title: 'شقة سكنية إكساء ممتاز في المزة، 120 متر مربع', price: '250,000,000 ل.س', img: '/__mockup/images/ls-class-1.png', loc: 'دمشق' },
              { cat: 'سيارات', title: 'كيا سيراتو 2018 خالية من العلام، أتوماتيك', price: '18,000 USD', img: '/__mockup/images/ls-class-2.png', loc: 'حلب' },
              { cat: 'إلكترونيات', title: 'آيفون 13 برو ماكس 256 غيغا، كفالة سنة', price: '1,200 USD', img: '/__mockup/images/ls-class-3.png', loc: 'حمص' },
              { cat: 'إلكترونيات', title: 'لابتوب ديل انسبايرون مخصص للتصميم والهندسة', price: '650 USD', img: '/__mockup/images/ls-class-4.png', loc: 'اللاذقية' },
              { cat: 'أثاث', title: 'طقم جلوس شرقي أصيل بحالة الوكالة', price: '3,500,000 ل.س', img: '/__mockup/images/ls-class-5.png', loc: 'دمشق' },
              { cat: 'إلكترونيات', title: 'كاميرا كانون احترافية مع عدستين', price: '450 USD', img: '/__mockup/images/ls-class-6.png', loc: 'طرطوس' },
            ].map((ad, i) => (
              <article key={i} className="group cursor-pointer flex flex-col">
                <div className="aspect-[4/3] w-full overflow-hidden mb-4 border border-[#E5E2D9] rounded-sm p-1 bg-white">
                  <img src={ad.img} alt={ad.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[#7A8277] text-xs font-ar-serif border border-[#D5D2C9] px-2 py-0.5 rounded-sm bg-white">{ad.cat}</span>
                  <div className="flex items-center gap-1 text-[#5C635A] text-sm font-ar-serif">
                    <MapPin className="w-3 h-3" /> {ad.loc}
                  </div>
                </div>
                <h4 className="text-xl font-ar-serif font-semibold text-[#2C312E] leading-tight mb-2 group-hover:text-[#A66D4F] transition-colors line-clamp-2">
                  {ad.title}
                </h4>
                <div className="mt-auto pt-3 border-t border-[#E5E2D9] flex justify-between items-center">
                  <span className="font-en-sans font-bold text-[#3C4A3E] tracking-tight">{ad.price}</span>
                  <span className="text-[#A66D4F] font-en-sans text-xs uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="border border-[#2C312E] text-[#2C312E] px-8 py-3 font-ar-serif text-lg hover:bg-[#2C312E] hover:text-[#FDFBF7] transition-colors rounded-sm inline-flex items-center gap-2">
              عرض المزيد من الإعلانات
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1C1F1E] text-[#D5D2C9] py-16 border-t-8 border-[#A66D4F]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-4xl font-ar-serif font-bold text-white mb-4">ليفينغ سوريا</h2>
              <p className="text-[#A1A6A0] font-ar-serif text-lg leading-relaxed max-w-sm mb-6">
                المنصة الأولى للأخبار الموثوقة والإعلانات المبوبة في سورية. نجمع بين أصالة المحتوى وسهولة الاستخدام.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <div className="w-10 h-10 border border-[#3C4A3E] rounded-full flex items-center justify-center hover:bg-[#3C4A3E] transition-colors cursor-pointer">
                  <span className="font-en-sans text-xs">FB</span>
                </div>
                <div className="w-10 h-10 border border-[#3C4A3E] rounded-full flex items-center justify-center hover:bg-[#3C4A3E] transition-colors cursor-pointer">
                  <span className="font-en-sans text-xs">X</span>
                </div>
                <div className="w-10 h-10 border border-[#3C4A3E] rounded-full flex items-center justify-center hover:bg-[#3C4A3E] transition-colors cursor-pointer">
                  <span className="font-en-sans text-xs">IG</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-ar-serif text-xl font-bold mb-6 border-b border-[#3C4A3E] pb-2">الأقسام</h4>
              <ul className="space-y-3 font-ar-serif text-[#A1A6A0]">
                <li><a href="#" className="hover:text-white transition-colors">الأخبار المحلية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الاقتصاد والأعمال</a></li>
                <li><a href="#" className="hover:text-white transition-colors">عقارات للبيع والإيجار</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سوق السيارات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">فرص العمل</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-en-serif text-xl font-bold mb-6 border-b border-[#3C4A3E] pb-2 uppercase tracking-widest">About</h4>
              <ul className="space-y-3 font-en-sans text-sm text-[#A1A6A0]">
                <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advertise with us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#3C4A3E] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-en-sans text-[#7A8277]">
            <p>&copy; 2026 LivingSyria. All rights reserved.</p>
            <p>Designed with elegant precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
