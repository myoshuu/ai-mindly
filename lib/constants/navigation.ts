// Navigation menu configuration
export const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: "home",
    roles: ["ADMIN", "NURSE", "PATIENT"],
  },
  {
    title: "Data Pengguna",
    href: "/patients",
    icon: "users",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Hasil Skrining",
    href: "/screening",
    icon: "clipboard",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Validasi AI",
    href: "/validation",
    icon: "check-circle",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Diagnosis (SDKI)",
    href: "/diagnosis",
    icon: "medical",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Luaran (SLKI)",
    href: "/outcomes",
    icon: "target",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Intervensi (SIKI)",
    href: "/intervention",
    icon: "activity",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: "chart",
    roles: ["ADMIN", "NURSE"],
  },
  {
    title: "Edukasi",
    href: "/education",
    icon: "book",
    roles: ["ADMIN", "NURSE", "PATIENT"],
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: "settings",
    roles: ["ADMIN", "NURSE"],
  },
];

export type NavigationItem = typeof navigationItems[number];

