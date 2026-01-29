"use client";

/**
 * Premium Header Component
 *
 * World-class navigation with elegant animations and refined interactions.
 * Features glass morphism, smooth transitions, theme toggle, and premium visual hierarchy.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  Home,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { authClient, getSession } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

// Navigation item type
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isAnchor?: boolean;
  authRequired?: boolean;
}

// Public navigation links
const publicLinks: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: <Home className="w-4 h-4" />,
  },
  {
    href: "/#features",
    label: "Features",
    isAnchor: true,
    icon: <Sparkles className="w-4 h-4" />,
  },
];

// Protected navigation links (shown when authenticated)
const protectedLinks: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    authRequired: true,
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: <CheckSquare className="w-4 h-4" />,
    authRequired: true,
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Determine which links to show
  const navLinks = isAuthenticated
    ? [...publicLinks.slice(0, 1), ...protectedLinks] // Home + protected links
    : publicLinks;

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

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

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

  // Check if link is active
  function isActiveLink(href: string): boolean {
    if (href === "/" && pathname === "/") {
      return true;
    }
    if (href === "/dashboard" && pathname === "/") {
      return false;
    }
    if (href.startsWith("/#")) {
      return false;
    }
    if (href !== "/" && pathname.startsWith(href)) {
      return true;
    }
    return false;
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
          "fixed top-0 left-0 right-0 z-40",
          "transition-all duration-300 ease-out",
          scrolled
            ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-sm border-b border-neutral-200/50 dark:border-neutral-800/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all duration-300">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                {/* AI Badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-900">
                  <Sparkles className="w-1.5 h-1.5 text-white" />
                </div>
              </motion.div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                Todo<span className="text-primary-600 dark:text-primary-400">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href);
                const linkClasses = cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "flex items-center gap-2",
                  isActive
                    ? "text-primary-700 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                );

                const content = (
                  <>
                    {link.icon}
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-primary-50 dark:bg-primary-950/30 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
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

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-20 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
                  <div className="w-24 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                      {userInitials}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[120px] truncate">
                      {userName || "User"}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    loading={loggingOut}
                    leftIcon={<LogOut className="w-4 h-4" />}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    {loggingOut ? "..." : "Logout"}
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<LogIn className="w-4 h-4" />}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      rightIcon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      }
                      className="shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/25"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right Section */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                  mobileMenuOpen
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                )}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed top-0 right-0 z-50 h-full w-full max-w-sm",
                "bg-white dark:bg-neutral-900",
                "shadow-2xl lg:hidden",
                "flex flex-col"
              )}
            >
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile (if authenticated) */}
              {isAuthenticated && !loading && (
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-semibold shadow-md">
                      {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">{userName || "User"}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Signed in</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navLinks.map((link, index) => {
                  const isActive = isActiveLink(link.href);
                  const linkClasses = cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200",
                    isActive
                      ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  );

                  const content = (
                    <>
                      <span
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                          isActive
                            ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
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

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {link.isAnchor ? (
                        <a href={link.href} className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
                          {content}
                        </a>
                      ) : (
                        <Link href={link.href} className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
                          {content}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="px-4 py-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50/30 dark:bg-neutral-800/30">
                {loading ? (
                  <div className="w-full h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
                ) : isAuthenticated ? (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    variant="secondary"
                    fullWidth
                    size="lg"
                    loading={loggingOut}
                    leftIcon={<LogOut className="w-5 h-5" />}
                    className="justify-center"
                  >
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </Button>
                ) : (
                  <>
                    <Link href="/register" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        fullWidth
                        size="lg"
                        rightIcon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        }
                        className="justify-center shadow-md shadow-primary-500/20"
                      >
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" fullWidth size="lg" className="justify-center">
                        Sign in to your account
                      </Button>
                    </Link>
                  </>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secured with encryption</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16 lg:h-[72px]" />
    </>
  );
}
