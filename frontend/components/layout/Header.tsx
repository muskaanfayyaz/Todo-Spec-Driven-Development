"use client";

/**
 * Header Component - Premium Global Navigation
 *
 * Responsive header with authentication-aware navigation.
 * Features mobile menu, active route indication, and scroll effects.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, getSession } from "@/lib/auth";
import Button from "@/components/ui/Button";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle logout
  async function handleLogout() {
    try {
      await authClient.signOut();
      setIsAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // Navigation links
  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/#features", label: "Features", isAnchor: true },
  ];

  const protectedLinks = isAuthenticated
    ? [{ href: "/tasks", label: "Tasks" }]
    : [];

  const allLinks = [...publicLinks, ...protectedLinks];

  // Check if link is active
  function isActiveLink(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    if (href.startsWith("/#")) {
      return false; // Anchor links don't have active state
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-header transition-all duration-300
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-neutral-200/50"
              : "bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900">
                Todo<span className="text-primary-600">App</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {allLinks.map((link) =>
                link.isAnchor ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActiveLink(link.href)
                          ? "text-primary-600 bg-primary-50"
                          : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                      }
                    `}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActiveLink(link.href)
                          ? "text-primary-600 bg-primary-50"
                          : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {loading ? (
                <div className="w-20 h-9 bg-neutral-100 rounded-lg animate-pulse" />
              ) : isAuthenticated ? (
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-modal md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-modal md:hidden slide-in-right">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200">
                <span className="text-lg font-bold text-neutral-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
                {allLinks.map((link) =>
                  link.isAnchor ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`
                        block px-4 py-3 rounded-lg text-base font-medium transition-colors
                        ${
                          isActiveLink(link.href)
                            ? "text-primary-600 bg-primary-50"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }
                      `}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        block px-4 py-3 rounded-lg text-base font-medium transition-colors
                        ${
                          isActiveLink(link.href)
                            ? "text-primary-600 bg-primary-50"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }
                      `}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="px-6 py-4 border-t border-neutral-200 space-y-3">
                {loading ? (
                  <div className="w-full h-10 bg-neutral-100 rounded-lg animate-pulse" />
                ) : isAuthenticated ? (
                  <Button onClick={handleLogout} variant="secondary" fullWidth>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="secondary" fullWidth>
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button fullWidth>Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16" />
    </>
  );
}
