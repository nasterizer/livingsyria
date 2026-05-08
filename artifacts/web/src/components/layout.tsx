import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Globe, Menu, X, User } from "lucide-react";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLocale = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary tracking-tight font-serif">LivingSyria</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/news" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.news")}
              </Link>
              <Link href="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.listings")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleLocale} title="Change Language">
                <Globe className="h-4 w-4" />
                <span className="sr-only">Toggle language</span>
                <span className="ms-2 text-xs font-semibold">{locale === "ar" ? "EN" : "عربي"}</span>
              </Button>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">{user?.firstName || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/me/listings">{t("nav.my_listings")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      {t("auth.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" onClick={login}>
                  {t("auth.login")}
                </Button>
              )}

              <Button asChild size="sm" className="gap-2">
                <Link href={isAuthenticated ? "/post" : "#"} onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    login();
                  }
                }}>
                  <PlusCircle className="h-4 w-4" />
                  {t("nav.post")}
                </Link>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 p-4 bg-background">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/news" 
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.news")}
              </Link>
              <Link 
                href="/listings" 
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.listings")}
              </Link>
              <div className="h-px bg-border/40 my-2" />
              
              <button 
                className="text-sm font-medium flex items-center gap-2 text-start"
                onClick={() => {
                  toggleLocale();
                  setMobileMenuOpen(false);
                }}
              >
                <Globe className="h-4 w-4" />
                {locale === "ar" ? "Switch to English" : "التبديل للعربية"}
              </button>

              {isAuthenticated ? (
                <>
                  <Link 
                    href="/me/listings" 
                    className="text-sm font-medium flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {t("nav.my_listings")}
                  </Link>
                  <button 
                    className="text-sm font-medium text-destructive text-start"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t("auth.logout")}
                  </button>
                </>
              ) : (
                <button 
                  className="text-sm font-medium text-start"
                  onClick={() => {
                    login();
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("auth.login")}
                </button>
              )}

              <Button asChild className="w-full justify-center gap-2 mt-2">
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
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t py-8 md:py-12 bg-card text-card-foreground">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LivingSyria. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
