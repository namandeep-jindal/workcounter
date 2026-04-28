import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Solution from "@/models/Solution";
import Query from "@/models/Query";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const queryId = Number(body.queryId);
    
    // Check if query is still open
    const queryDoc = await Query.findOne({ queryId: queryId });
    if (queryDoc && queryDoc.status === "Approved") {
      return NextResponse.json({ error: "Query is closed for solutions" }, { status: 400 });
    }
    
    // Calculate onChainIndex (count existing solutions for this query)
    const count = await Solution.countDocuments({ queryId: queryId });
    
    const solution = await Solution.create({
      expert: body.hunter || body.expert,
      queryId: queryId,
      ipfsLink: body.ipfsLink,
      proofText: body.proofText,
      onChainIndex: count
    });
    return NextResponse.json(solution, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const searchQueryId = searchParams.get("queryId");
    const expert = searchParams.get("expert") || searchParams.get("hunter");

    let queryFilter: any = {};
    if (searchQueryId) queryFilter.queryId = Number(searchQueryId);
    if (expert) queryFilter.expert = expert;

    // Fetch in chronological order to determine correct indices
    const solutions = await Solution.find(queryFilter).sort({ timestamp: 1 });
    
    // Auto-heal missing indices on the fly
    const results = solutions.map((s, index) => {
      const obj = s.toObject();
      if (obj.onChainIndex === undefined || obj.onChainIndex === null) {
        obj.onChainIndex = index;
        // Background heal
        Solution.updateOne({ _id: s._id }, { $set: { onChainIndex: index } }).exec();
      }
      return obj;
    });

    return NextResponse.json(results.reverse()); // Return newest first for UI
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
