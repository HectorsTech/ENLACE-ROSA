import { LogoEira } from "@/components/LogoEira";
import { FormLoginEira } from "./FormLoginEira";

export default function LoginEira() {
  return (
    <main className="grid min-h-screen place-items-center bg-lienzo px-6">
      <div className="w-full max-w-sm space-y-6">
        <LogoEira />
        <div className="tarjeta p-8">
          <p className="ojal">Equipo EIRA</p>
          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight">Iniciar <em>sesión</em></h1>
          <FormLoginEira />
        </div>
      </div>
    </main>
  );
}
