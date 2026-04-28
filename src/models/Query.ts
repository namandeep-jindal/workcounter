import mongoose, { Schema, model, models } from "mongoose";

const QuerySchema = new Schema({
  queryId: { type: Number, required: true, unique: true },
  poster: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Social", "Creative", "Technical", "Research", "Business", "Other"], default: "Technical" },
  reward: { type: String, required: true },
  deadline: { type: String, required: true },
  status: { type: String, enum: ["Active", "Urgent", "Approved", "Disputed"], default: "Active" },
  creationTxHash: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const Query = models.Query || model("Query", QuerySchema);
export default Query;
