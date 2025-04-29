import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema(
  {
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    products: [
        {
          productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
          },
          name: { type: String, required: true },
          description: String,
          colour: {
            name: String,
            hex: String,
            image: String,
            sizes: {
              size: String,
              stock: Number,
              price: Number,
              sku: String,
            },
          },
          quantity: { type: Number, required: true }, // e.g. "1 x 2.1 Liter"
        },
      ],

    // Price summary
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WishList", wishlistSchema);
