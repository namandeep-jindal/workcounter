import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Solution from "@/models/Solution";
import Query from "@/models/Query";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { posterAddress } = await req.json();

    const solution = await Solution.findById(id);
    if (!solution) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    const queryDoc = await Query.findOne({ queryId: solution.queryId });
    if (!queryDoc) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }

    // Security check: Only the poster can approve
    if (queryDoc.poster !== posterAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update statuses
    solution.approved = true;
    await solution.save();

    queryDoc.status = "Approved";
    await queryDoc.save();

    return NextResponse.json({ message: "Solution approved and reward triggered" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
