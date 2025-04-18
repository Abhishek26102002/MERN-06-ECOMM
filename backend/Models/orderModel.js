import mongoose from "mongoose";

const userScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    orderBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

export default mongoose.model("orders", userScheme);
// Users is Collection name in database
