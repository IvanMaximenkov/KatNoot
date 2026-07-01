import { NextResponse } from "next/server";
import { listClubs } from "@/lib/db/repository";

export async function GET() {
  const clubs = await listClubs();
  return NextResponse.json({ clubs });
}
