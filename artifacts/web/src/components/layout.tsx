"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Menu,
  X,
  User,
  Search,
  Newspaper,
  Store,
  LogOut,
} from "lucide-react";
import { useState } from "react";

function BrandMark() {
  return (
    <div className="flex flex-col leading-none">
      <span className="font-bold text-2xl tracking-tight text-primary">
        ليفينغ سوريا
      </span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
        LivingSyria
      </span>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale, path } = useI18n();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const toggleLocale = () => setLocale(locale === "ar" ? "en" : "ar");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) {
      router.push(path("/listings"));
    } else {
      router.push(`${path("/listings")}?q=${encodeURIComponent(q)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans">
      <header className="sticky top-0 z-40 w-full bg-card/80 backdrop-blur-xl border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <Link href={path("/")} className="shrink-0">
              <BrandMark />
            </Link>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl relative group"
          >
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("nav.search_placeholder")}
              className="w-full h-12 ps-12 pe-28 rounded-full border-border bg-secondary focus-visible:ring-primary text-base"
            />
            <div className="absolute inset-y-1 end-1">
              <Button
                type="submit"
                className="h-10 rounded-full bazaar-accent-gradient hover:opacity-90 border-0 px-6 font-semibold shadow-md shadow-amber-500/20 text-foreground"
              >
                {t("common.search")}
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleLocale}
              aria-label={t("locale.toggle_aria")}
              className="hidden md:flex items-center justify-center px-3 py-1.5 rounded-full bg-secondary text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              <span className={locale === "en" ? "text-primary" : ""}>EN</span>
              <span className="mx-1.5 text-border">|</span>
              <span className={locale === "ar" ? "text-primary" : ""}>AR</span>
            </button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-secondary text-primary hover:bg-primary/10"
                  >
                    <div className="w-7 h-7 rounded-full bazaar-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {(user?.firstName || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 text-sm">
                    <div className="font-semibold truncate">
                      {user?.firstName || user?.email?.split("@")[0]}
                    </div>
                    {user?.email && (
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={path("/account/listings")} className="gap-2 cursor-pointer">
                      <Store className="h-4 w-4" />
                      {t("nav.my_listings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={login}
                aria-label={t("auth.login")}
                className="rounded-full bg-secondary text-primary hover:bg-primary/10"
              >
                <User className="w-5 h-5" />
              </Button>
            )}

            <Button
              asChild
              className="hidden sm:flex rounded-full bazaar-gradient hover:opacity-90 shadow-lg shadow-emerald-700/20 font-bold px-6 h-11 gap-2 text-primary-foreground border-0"
            >
              <Link
                href={isAuthenticated ? path("/listings/new") : "#"}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    login();
                  }
                }}
              >
                <PlusCircle className="h-5 w-5" />
                {t("nav.post")}
              </Link>
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-card">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={t("nav.search_placeholder")}
                    className="ps-10 h-11 rounded-full bg-secondary border-transparent"
                  />
                </div>
              </form>

              <nav className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="justify-start gap-2 rounded-2xl h-12">
                  <Link href={path("/news")} onClick={() => setMobileMenuOpen(false)}>
                    <Newspaper className="h-4 w-4" />
                    {t("nav.news")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2 rounded-2xl h-12">
                  <Link href={path("/listings")} onClick={() => setMobileMenuOpen(false)}>
                    <Store className="h-4 w-4" />
                    {t("nav.listings")}
                  </Link>
                </Button>
              </nav>

              <Button
                asChild
                className="w-full justify-center gap-2 rounded-full h-12 bazaar-gradient text-primary-foreground border-0 shadow-md"
              >
                <Link
                  href={isAuthenticated ? path("/listings/new") : "#"}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (!isAuthenticated) {
                      e.preventDefault();
                      login();
                    }
                  }}
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("nav.post")}
                </Link>
              </Button>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <button
                  onClick={() => {
                    toggleLocale();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium text-foreground"
                >
                  {t("locale.switch_other")}
                </button>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href={path("/account/listings")}
                      className="text-sm font-medium text-foreground flex items-center gap-1.5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      {t("nav.my_listings")}
                    </Link>
                    <button
                      className="text-sm font-medium text-destructive"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t("auth.logout")}
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-sm font-medium text-primary"
                    onClick={() => {
                      login();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t("auth.login")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative">{children}</main>

      <footer
        className="text-emerald-100/70 pt-16 pb-8 border-t-[12px] border-emerald-500 rounded-t-[3rem] mt-12"
        style={{ backgroundColor: "hsl(160 84% 8%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex flex-col mb-4">
                <span className="font-bold text-3xl text-white">ليفينغ سوريا</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1">
                  LivingSyria
                </span>
              </div>
              <p className="text-emerald-100/80 leading-relaxed max-w-sm mb-6 text-sm">
                {t("footer.tagline")}
              </p>
              <div className="flex gap-3">
                {["FB", "IG", "X"].map((s) => (
                  <div
                    key={s}
                    className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 hover:bg-emerald-800 cursor-pointer transition-colors text-sm font-bold"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">{t("footer.product")}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href={path("/listings")} className="hover:text-white transition-colors">
                    {t("nav.listings")}
                  </Link>
                </li>
                <li>
                  <Link href={path("/news")} className="hover:text-white transition-colors">
                    {t("nav.news")}
                  </Link>
                </li>
                <li>
                  <Link href={path("/listings/new")} className="hover:text-white transition-colors">
                    {t("nav.post")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-4">{t("footer.community")}</h4>
              <ul className="space-y-3 text-sm">
                <li><span className="hover:text-white transition-colors cursor-default">{t("footer.about")}</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">{t("footer.contact")}</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">{t("footer.privacy")}</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">{t("footer.terms")}</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-900/50 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-emerald-100/50 gap-3">
            <p>© {new Date().getFullYear()} LivingSyria. {t("footer.rights")}.</p>
            <span>{t("footer.made_with")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
