import { model, models, Schema, Types } from "mongoose";

const BrandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Brand = models.Brand || model("Brand", BrandSchema);

const SizeSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const VarietySchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    colorName: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    imgLinks: { type: [String], required: true },
    sizes: { type: [SizeSchema], required: true },
  },
  { _id: false },
);

const DescriptionSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

export const Category = models.Category || model("Category", CategorySchema);

const SubcategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate subcategories under same category
SubcategorySchema.index({ name: 1, categoryId: 1 }, { unique: true });

export const Subcategory =
  models.Subcategory || model("Subcategory", SubcategorySchema);

const ProductSchema = new Schema(
  {
    brandId: { type: Types.ObjectId, ref: "Brand", required: true },
    productName: { type: String, required: true, trim: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    thumbnail: { type: String, required: true },
    variety: { type: [VarietySchema], required: true },
    desc: { type: [DescriptionSchema], required: true },
  },
  { timestamps: true },
);

export const Product = models.Product || model("Product", ProductSchema);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    role: { type: String, enum: ["user", "admin"], required: true },
    phone: { type: Number, required: true },
    hashedPassword: { type: String, required: true },
    address: { type: String, trim: true },
    cart: {
      type: [
        {
          productId: { type: Types.ObjectId, ref: "Product", required: true },
          sizeId: String,
          colorId: String,
        },
      ],
      required: true,
      ref: "Product",
    },
  },
  { timestamps: true },
);

export const User = models.User || model("User", UserSchema);

const OrderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    items: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        name: String,
        color: String,
        size: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true },
);

export const Order = models.Order || model("Order", OrderSchema); 