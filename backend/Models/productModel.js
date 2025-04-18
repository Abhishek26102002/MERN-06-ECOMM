import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  sku: {
    type: String,
    required: true
  }
});

const ColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hex: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  sizes: {
    type: [SizeSchema],
    required: true
  }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  colors: {
    type: [ColorSchema],
    required: true
  }
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

export default mongoose.model('products', ProductSchema);

