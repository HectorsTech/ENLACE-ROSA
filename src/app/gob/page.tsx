import { Landmark } from "lucide-react";
import { listarJornadas } from "@/lib/db";
import { FormIdMunicipal } from "./FormIdMunicipal";

export const dynamic = "force-dynamic";

export default async function AccesoGob() {
  const ids = (await listarJornadas()).map((j) => j.token);
  return (
    <div className="mx-auto max-w-md space-y-8 py-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-guinda text-white">
          <Landmark className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-serif text-4xl font-normal tracking-tight">Bienvenida, persona <em>enlace municipal</em></h1>
        <p className="mt-2 text-pizarra-suave">Ingresa el ID único que te asignó EIRA. No necesitas contraseña.</p>
      </div>
      <div className="tarjeta p-6 text-left">
        <FormIdMunicipal />
      </div>
      <p className="text-xs text-pizarra-suave">
        IDs de demostración: {ids.map((id) => <code key={id} className="mx-1 rounded bg-crema px-1.5 py-0.5">{id}</code>)}
      </p>
    </div>
  );
}
