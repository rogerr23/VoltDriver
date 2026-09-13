import Link from "next/link";

import { DashboardIcon, type DashboardIconName } from "./dashboard-icon";

const items: { href: string; label: string; icon: DashboardIconName; active?: boolean }[] = [
  { href: "/", label: "Início", icon: "home", active: true },
  { href: "/recargas/nova", label: "Recargas", icon: "bolt" },
  { href: "/metas", label: "Metas", icon: "target" },
  { href: "/veiculo", label: "Veículo", icon: "settings" },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-[#07110f]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto grid w-full max-w-2xl grid-cols-4 px-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-lime-300 ${
              item.active ? "text-lime-300" : "text-slate-500 hover:text-slate-200"
            }`}
          >
            <DashboardIcon name={item.icon} className="size-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
