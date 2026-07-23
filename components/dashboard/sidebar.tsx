"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/constants/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  ClipboardList,
  CheckCircle,
  Stethoscope,
  Activity,
  Target,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  users: Users,
  clipboard: ClipboardList,
  "check-circle": CheckCircle,
  medical: Stethoscope,
  activity: Activity,
  target: Target,
  chart: BarChart3,
  book: BookOpen,
  settings: Settings,
};

interface SidebarProps {
  userRole?: string;
  userName?: string;
  notificationCount?: number;
}

export const Sidebar = ({ userRole = "NURSE", userName = "Pengguna", notificationCount = 0 }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const filteredNav = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center shadow-xs">
              <img src="/ai-mindly.jpeg" alt="AI-Mindly Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1">
                <span className="text-blue-600 dark:text-blue-400">AI</span>-Mindly
              </h1>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                Sistem Skrining & CDSS
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <ul className="space-y-1.5">
            {filteredNav.map((item) => {
              const Icon = iconMap[item.icon] || Home;
              const isActive = item.href === "/" 
                ? pathname === "/" 
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[#0066FF] text-white shadow-sm font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-slate-700/60 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400")} />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <button className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Notifikasi</span>
            {notificationCount > 0 && (
              <span className="absolute top-2 right-4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="relative mt-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userRole.toLowerCase()}
                </p>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                isUserMenuOpen && "rotate-180"
              )} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
