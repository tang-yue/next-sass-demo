import { NextResponse } from "next/server";
import * as z from 'zod'
import { userUpdateSchema, userInsertSchema } from "@/server/db/validate-schema";

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // const name = searchParams.get('name')
  const email = searchParams.get('email')
  const result = userInsertSchema.safeParse({ email })
  if (!result.success) {
    return NextResponse.json({ error: JSON.parse(result.error.message) }, { status: 400 })
  }
  return NextResponse.json({ message: "Hello, world555!", result })  
}