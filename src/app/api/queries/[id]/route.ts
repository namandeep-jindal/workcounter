import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Query from "@/models/Query";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const id = (await params).id;
    
    const queryDoc = await Query.findByIdAndDelete(id);
    
    if (!queryDoc) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Query removed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
