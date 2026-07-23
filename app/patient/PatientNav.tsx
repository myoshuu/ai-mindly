"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Brain, BookOpen, User } from "lucide-react";

const PatientNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/patient/beranda", icon: Home, label: "Beranda" },
    { href: "/patient/screening", icon: Brain, label: "Skrining" },
    { href: "/patient/education", icon: BookOpen, label: "Edukasi" },
    { href: "/patient/settings", icon: User, label: "Profil" },
  ];

  const isActive = (href: string) => {
    if (href === "/patient/beranda") {
      return pathname === "/patient/beranda" || pathname === "/patient";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 py-3 px-6 flex justify-between items-center z-50 shadow-lg">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active
                ? "text-[#0066FF]"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default PatientNav;
