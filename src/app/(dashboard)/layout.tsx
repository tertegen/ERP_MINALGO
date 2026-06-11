"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/contratos", label: "Contratos" },
  { href: "/planilla", label: "Planilla" },
  { href: "/pipeline", label: "Proyecciones" },
  { href: "/calendario", label: "Calendario" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full bg-[#F0EFED]">
      {/* Sidebar */}
      <aside className="w-52 flex flex-col shrink-0">
        <div className="px-4 pt-6 pb-5">
          <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
            MINALGO
          </span>
          <span className="block text-[11px] text-gray-400 mt-0.5">Dashboard Comercial</span>
        </div>

        <div className="px-3 mb-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
            Vistas
          </p>
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    active
                      ? "bg-gray-900 text-white font-medium"
                      : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4 py-4 text-[11px] text-gray-400">
          Mario López · Admin
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-white rounded-tl-2xl shadow-sm">
        {children}
      </main>
    </div>
  );
}
