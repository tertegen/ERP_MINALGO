"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/clientes", label: "Clientes", icon: "⬡" },
  { href: "/contratos", label: "Contratos", icon: "◧" },
  { href: "/planilla", label: "Planilla", icon: "▤" },
  { href: "/pipeline", label: "Proyecciones", icon: "◈" },
  { href: "/calendario", label: "Calendario", icon: "◫" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-base font-semibold text-gray-900 tracking-tight">
            MINALGO
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">ERP v1.0</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100 text-xs text-gray-400">
          Mario Lopéz · Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
