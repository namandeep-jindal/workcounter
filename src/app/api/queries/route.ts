import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Query from "@/models/Query";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const poster = searchParams.get("poster");
    const filter = poster ? { poster } : {};
    const queries = await Query.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(queries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const query = await Query.create(body);
    return NextResponse.json(query, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
