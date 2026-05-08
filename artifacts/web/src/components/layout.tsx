import { Link, useLocation } from "wouter";
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
  Globe,
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
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[hsl(15_85%_38%)] flex items-center justify-center text-primary-foreground font-bold font-serif text-lg shadow-sm">
        ل
      </div>
      <div className="leading-none">
        <div className="text-xl font-bold tracking-tight font-serif text-foreground">
          LivingSyria
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
          سوريا الحيّة
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [, navigate] = useLocation();

  const toggleLocale = () => setLocale(locale === "ar" ? "en" : "ar");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) {
      navigate("/listings");
    } else {
      navigate(`/listings?q=${encodeURIComponent(q)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <BrandMark />
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-4"
          >
            <div className="relative w-full group">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("nav.search_placeholder")}
                className="ps-10 h-10 rounded-full bg-secondary/60 border-transparent focus-visible:bg-card focus-visible:border-primary/30 focus-visible:ring-primary/20"
              />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-1 ms-auto md:ms-0">
            <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full">
              <Link href="/news">
                <Newspaper className="h-4 w-4" />
                {t("nav.news")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full">
              <Link href="/listings">
                <Store className="h-4 w-4" />
                {t("nav.listings")}
              </Link>
            </Button>
          </nav>

          <div className="hidden md:flex items-center gap-2 ms-auto lg:ms-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              aria-label={t("locale.toggle_aria")}
              className="gap-2 rounded-full text-xs font-semibold uppercase tracking-wide"
            >
              <Globe className="h-4 w-4" />
              {locale === "ar" ? "EN" : "عربي"}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-[hsl(190_60%_28%)] flex items-center justify-center text-accent-foreground text-xs font-bold">
                      {(user?.firstName || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden xl:inline max-w-[100px] truncate">
                      {user?.firstName || user?.email?.split("@")[0] || "User"}
                    </span>
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
                    <Link href="/me/listings" className="gap-2 cursor-pointer">
                      <Store className="h-4 w-4" />
                      {t("nav.my_listings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={login} className="rounded-full">
                {t("auth.login")}
              </Button>
            )}

            <Button
              asChild
              size="sm"
              className="gap-2 rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Link
                href={isAuthenticated ? "/post" : "#"}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    login();
                  }
                }}
              >
                <PlusCircle className="h-4 w-4" />
                {t("nav.post")}
              </Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ms-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={t("nav.search_placeholder")}
                    className="ps-10 h-11 rounded-full bg-secondary/60 border-transparent"
                  />
                </div>
              </form>

              <nav className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="justify-start gap-2 rounded-xl h-12">
                  <Link href="/news" onClick={() => setMobileMenuOpen(false)}>
                    <Newspaper className="h-4 w-4" />
                    {t("nav.news")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2 rounded-xl h-12">
                  <Link href="/listings" onClick={() => setMobileMenuOpen(false)}>
                    <Store className="h-4 w-4" />
                    {t("nav.listings")}
                  </Link>
                </Button>
              </nav>

              <Button
                asChild
                className="w-full justify-center gap-2 rounded-full h-12 shadow-sm"
              >
                <Link
                  href={isAuthenticated ? "/post" : "#"}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (!isAuthenticated) {
                      e.preventDefault();
                      login();
                    }
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  {t("nav.post")}
                </Link>
              </Button>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <button
                  onClick={() => {
                    toggleLocale();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium flex items-center gap-2 text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {t("locale.switch_other")}
                </button>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/me/listings"
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

      <footer className="mt-16 border-t border-border/60 bg-card">
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <BrandMark />
            <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3 text-foreground">
              {t("footer.product")}
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/news" className="hover:text-primary transition-colors">
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-primary transition-colors">
                  {t("nav.listings")}
                </Link>
              </li>
              <li>
                <Link href="/post" className="hover:text-primary transition-colors">
                  {t("nav.post")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3 text-foreground">
              {t("footer.community")}
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.about")}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} LivingSyria. {t("footer.rights")}.
          </div>
        </div>
      </footer>
    </div>
  );
}
