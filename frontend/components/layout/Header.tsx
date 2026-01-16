"use client";

/**
 * Premium Header Component
 *
 * World-class navigation with elegant animations and refined interactions.
 * Features glass morphism, smooth transitions, and premium visual hierarchy.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();
        setIsAuthenticated(!!session);
        setUserName(session?.user?.name || session?.user?.email?.split("@")[0] || null);
      } catch (error) {
        setIsAuthenticated(false);
        setUserName(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  // Handle scroll effect with debounce
  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      setIsAuthenticated(false);
      setUserName(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  // Navigation links
  type NavLink = {
    href: string;
    label: string;
    isAnchor?: boolean;
    icon?: React.ReactNode;
  };

  const publicLinks: NavLink[] = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/#features",
      label: "Features",
      isAnchor: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  const protectedLinks: NavLink[] = isAuthenticated
    ? [
        {
          href: "/tasks",
          label: "My Tasks",
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
      ]
    : [];

  const allLinks: NavLink[] = [...publicLinks, ...protectedLinks];

  // Check if link is active
  function isActiveLink(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    if (href.startsWith("/#")) {
      return false;
    }
    return pathname.startsWith(href);
  }

  // Get user initials for avatar
  const userInitials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-header transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-neutral-200/50"
            : "bg-white/0"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-primary-400 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold text-neutral-900 tracking-tight">
                Todo<span className="text-primary-600">App</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {allLinks.map((link) => {
                const isActive = isActiveLink(link.href);
                const linkClasses = cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary-700"
                    : "text-neutral-600 hover:text-neutral-900"
                );

                const content = (
                  <>
                    {link.label}
                    {/* Active indicator */}
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary-500 rounded-full transition-all duration-200",
                        isActive ? "w-4" : "w-0"
                      )}
                    />
                  </>
                );

                return link.isAnchor ? (
                  <a key={link.href} href={link.href} className={linkClasses}>
                    {content}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={linkClasses}>
                    {content}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-20 h-9 bg-neutral-100 rounded-lg animate-pulse" />
                  <div className="w-24 h-9 bg-neutral-100 rounded-lg animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-100/80 border border-neutral-200/60">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                      {userInitials}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                      {userName || "User"}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    loading={loggingOut}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    {loggingOut ? "..." : "Logout"}
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/25">
                      Get Started
                      <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                mobileMenuOpen
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-5 h-5">
                {/* Hamburger to X animation */}
                <span
                  className={cn(
                    "absolute left-0 block w-5 h-0.5 bg-current rounded-full transition-all duration-300",
                    mobileMenuOpen ? "top-[9px] rotate-45" : "top-1"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[9px] block w-5 h-0.5 bg-current rounded-full transition-all duration-300",
                    mobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block w-5 h-0.5 bg-current rounded-full transition-all duration-300",
                    mobileMenuOpen ? "top-[9px] -rotate-45" : "top-[17px]"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-modal md:hidden transition-all duration-300",
          mobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <span className="text-lg font-bold text-neutral-900">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Profile (if authenticated) */}
            {isAuthenticated && !loading && (
              <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-semibold shadow-md">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 truncate">{userName || "User"}</p>
                    <p className="text-sm text-neutral-500">Signed in</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {allLinks.map((link, index) => {
                const isActive = isActiveLink(link.href);
                const linkClasses = cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200",
                  isActive
                    ? "text-primary-700 bg-primary-50"
                    : "text-neutral-700 hover:bg-neutral-100"
                );

                const content = (
                  <>
                    <span
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                        isActive ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </>
                );

                return link.isAnchor ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className={linkClasses}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClasses}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {content}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="px-4 py-4 border-t border-neutral-100 space-y-3 bg-neutral-50/30">
              {loading ? (
                <div className="w-full h-12 bg-neutral-100 rounded-xl animate-pulse" />
              ) : isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  fullWidth
                  size="lg"
                  loading={loggingOut}
                  className="justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loggingOut ? "Signing out..." : "Sign out"}
                </Button>
              ) : (
                <>
                  <Link href="/register" className="block">
                    <Button fullWidth size="lg" className="justify-center shadow-md shadow-primary-500/20">
                      Get Started Free
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button variant="secondary" fullWidth size="lg" className="justify-center">
                      Sign in to your account
                    </Button>
                  </Link>
                </>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-neutral-500">
                <svg className="w-3.5 h-3.5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secured with encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16 lg:h-18" />
    </>
  );
}
