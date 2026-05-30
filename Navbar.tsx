'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Wallet, BookOpen,
  Calculator, Bot, User, Menu, X, Sun, Moon, Globe,
  LogOut, ChevronDown, Mail, Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard },
  { key: 'markets', href: '/markets', icon: TrendingUp },
  { key: 'invest', href: '/invest', icon: Wallet },
  { key: 'simulator', href: '/simulator', icon: Calculator },
  { key: 'aiMentor', href: '/ai-mentor', icon: Bot },
  { key: 'learn', href: '/learn', icon: BookOpen },
];

function getInitials(email: string, name?: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return email.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, user, setUser } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleLang = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setProfileOpen(false);
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-card border-b shadow-lg'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse-glow" />
                <div className="relative w-8 h-8 rounded-full border border-amber-500/50 flex items-center justify-center">
                  <span className="text-amber-400 font-display font-bold text-sm">₹</span>
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-lg" style={{ color: 'var(--text-accent)' }}>Arth</span>
                <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Netra</span>
                <div className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '2px' }}>
                  FINANCE AI
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ key, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={key}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive ? 'text-amber-400 bg-amber-400/10' : 'hover:text-amber-400 hover:bg-amber-400/5'
                    }`}
                    style={{ color: isActive ? 'var(--accent-amber)' : 'var(--text-secondary)' }}
                  >
                    <Icon size={15} />
                    <span>{t(`nav.${key}`)}</span>
                  </Link>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: 'var(--border-accent)',
                  color: 'var(--accent-amber)',
                  background: 'var(--accent-amber-glow)',
                }}
              >
                <Globe size={13} />
                {language === 'en' ? 'हिं' : 'EN'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Profile / Login button */}
              {user ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border transition-all hover:scale-105"
                    style={{
                      borderColor: 'var(--border-accent)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--accent-amber)', color: '#000' }}
                    >
                      {getInitials(user.email, user.name)}
                    </div>
                    <span className="text-xs font-medium max-w-[80px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          zIndex: 100,
                        }}
                      >
                        {/* Profile header */}
                        <div
                          className="p-4 border-b"
                          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ background: 'var(--accent-amber)', color: '#000' }}
                            >
                              {getInitials(user.email, user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                {user.name || user.email.split('@')[0]}
                              </p>
                              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {/* Badges */}
                          <div className="flex gap-2 mt-3">
                            <span
                              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                            >
                              <Shield size={10} /> Verified
                            </span>
                            <span
                              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)' }}
                            >
                              ₹ Investor
                            </span>
                          </div>
                        </div>

                        {/* Info rows */}
                        <div className="p-2">
                          <div
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                            <span className="truncate">{user.email}</span>
                          </div>

                          <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{
                              background: 'rgba(239,68,68,0.08)',
                              color: '#EF4444',
                              border: '1px solid rgba(239,68,68,0.15)',
                            }}
                          >
                            <LogOut size={14} />
                            {loggingOut ? 'Signing out...' : 'Sign Out'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                  style={{ background: 'var(--accent-amber)', color: '#000' }}
                >
                  <User size={13} />
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 rounded-lg border flex items-center justify-center"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                }}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-72 glass-card border-l shadow-2xl flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="font-display font-bold" style={{ color: 'var(--accent-amber)' }}>ArthNetra</span>
              <button onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Profile section in drawer */}
            {user && (
              <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'var(--accent-amber)', color: '#000' }}
                  >
                    {getInitials(user.email, user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="p-4 space-y-1 flex-1">
              {navItems.map(({ key, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-amber-400/10' : 'hover:bg-amber-400/5'
                    }`}
                    style={{ color: isActive ? 'var(--accent-amber)' : 'var(--text-secondary)' }}
                  >
                    <Icon size={18} />
                    {t(`nav.${key}`)}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pb-8 space-y-3">
              <button
                onClick={toggleLang}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all"
                style={{ borderColor: 'var(--border-accent)', color: 'var(--accent-amber)', background: 'var(--accent-amber-glow)' }}
              >
                <Globe size={16} />
                {language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <LogOut size={16} />
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--accent-amber)', color: '#000' }}
                >
                  <User size={16} />
                  {t('auth.login')} / {t('auth.signup')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
