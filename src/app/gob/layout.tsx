import Link from "next/link";
import { LayoutDashboard, Ribbon, ShieldCheck } from "lucide-react";
import { AutoRefresco } from "@/components/AutoRefresco";

export const dynamic = "force-dynamic";

export default function LayoutGob({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F6]">
      <AutoRefresco />
      <div className="h-1.5 bg-gradient-to-r from-guinda via-guinda to-dorado" />
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/gob" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rosa text-white shadow-sm">
              <Ribbon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="h-8 w-px bg-slate-200" />
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-extrabold text-guinda">Portal Municipal</span>
              <span className="block text-[11px] font-medium text-pizarra-suave">Enlace Rosa · EIRA Movimiento Rosa A.C.</span>
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-dorado/40 bg-dorado-50 px-3 py-1 text-[11px] font-semibold text-[#8A6A3A] sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" /> Coordinación interinstitucional
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-pizarra-suave">
          <p>EIRA Movimiento Rosa A.C. · Jornadas de detección oportuna de cáncer de mama y cervicouterino</p>
          <Link href="/eira" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-slate-400 transition hover:bg-rosa-50 hover:text-rosa-700">
            <LayoutDashboard className="h-3.5 w-3.5" /> Cambiar a vista EIRA (demo)
          </Link>
        </div>
      </footer>
    </div>
  );
}
