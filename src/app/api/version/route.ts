import { NextResponse } from "next/server";
import { leerDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await leerDB();
  return NextResponse.json({ version: db.version, actualizadoEn: db.actualizadoEn });
}
