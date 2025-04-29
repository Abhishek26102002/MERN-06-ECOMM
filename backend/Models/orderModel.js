import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    orderID: { type: String, required: true, unique: true },

    // Ordered by user
    orderBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },

    // Products in the order
    products: [
      {
        productID: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
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
            sku: String
          }
        },
        quantity: { type: Number, required: true }, // e.g. "1 x 2.1 Liter"
        totalPrice: { type: Number, required: true } // quantity * price
      }
    ],

    // Price summary
    totalAmount: { type: Number, required: true },

    // Order status tracking
    status: {
      type: String,
      enum: ["ordered", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "ordered"
    },

    // Timeline breakdown
    deliveryTimeline: {
      orderDate: { type: Date, default: Date.now },
      shippingDate: Date,
      outForDeliveryDate: Date,
      deliveredDate: Date
    },

    // Shipping address
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },

    // Billing address
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },

    // Payment info
    paymentMethod: { type: String }, // e.g., "UPI", "Card", "COD"
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    transactionId: String,

    // Cancellation & refund
    isCancelled: { type: Boolean, default: false },
    cancelReason: String,
    refundStatus: {
      type: String,
      enum: ["none", "processing", "completed"],
      default: "none"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Orders", orderSchema);
