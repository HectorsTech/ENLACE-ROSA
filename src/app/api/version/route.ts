import { NextResponse } from "next/server";
import { hayRedis, leerDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await leerDB();
  return NextResponse.json({ version: db.version, actualizadoEn: db.actualizadoEn, almacenamiento: hayRedis() ? "redis" : "local" });
}
