import { NextResponse } from "next/server";
import { leerDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const db = leerDB();
  return NextResponse.json({ version: db.version, actualizadoEn: db.actualizadoEn });
}
