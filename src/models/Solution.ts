import mongoose, { Schema, model, models } from "mongoose";

const SolutionSchema = new Schema({
  queryId: { type: Number, required: true },
  expert: { type: String, required: true },
  ipfsLink: { type: String, required: false },
  proofText: { type: String, required: false },
  onChainIndex: { type: Number, required: true },
  approved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const Solution = models.Solution || model("Solution", SolutionSchema);
export default Solution;
