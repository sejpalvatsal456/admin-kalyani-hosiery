import { model, models, Schema, Types } from "mongoose";

// --- Sub-Schemas ---

const AddressSchema = new Schema(
  {
    house: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    colorId: { type: String, required: true },
    sizeId: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const SizeSchema = new Schema(
  {
    sizeID: { type: String, required: true },
    sku: { type: String, required: true },
    sizeName: { type: String, required: true },
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false },
);

const VarietySchema = new Schema(
  {
    colorID: { type: String, required: true },
    colorName: { type: String, required: true },
    colorCode: {
      type: String,
      required: true,
      maxlength: 7,
      match: /^#/,
    },
    imgLinks: { type: [String], default: [] },
    sizes: {
      type: [SizeSchema],
      validate: [
        (val: any[]) => val.length >= 1,
        "Must have at least one size",
      ],
    },
  },
  { _id: false },
);

// --- Main Models ---

// User Model
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, default: "" },
    address: { type: String, default: null },
    hashedPassword: { type: String, required: true },
    cart: { type: [CartSchema], default: [] },
    orders: [{ type: [Types.ObjectId], ref: "Order" }],
  },
  { timestamps: true },
);

export interface IAdmin extends Document {
  username: string;

  hashedPassword: string;

  permissions: string[];

  lastLogin?: Date;

  createdBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    hashedPassword: {
      type: String,
      required: true,
    },

    permissions: [
      {
        type: String,
      },
    ],

    lastLogin: {
      type: Date,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

// Category Model
const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    theme: { type: String, required: true },
  },
  { timestamps: true },
);

// Subcategory Model
const SubcategorySchema = new Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    slug: { type: String, required: true, slug: true },
    logoLink: { type: String, required: true },
  },
  { timestamps: true },
);

const BrandSchema = new Schema(
  {
    brandName: { type: String, required: true },
    brandLogo: { type: String, required: true },
  },
  { timestamps: true },
);

const DescriptionSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

// Product Model
const ProductSchema = new Schema(
  {
    productName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brandId: { type: Types.ObjectId, ref: "Brand", required: true },
    thumbnail: { type: String, required: true },
    tags: { type: [String], default: [] },
    varients: { type: [VarietySchema], default: [] },
    desc: {
      type: [DescriptionSchema],
      default: [],
    },
    loc: { type: String, required: true },
  },
  { timestamps: true },
);

// Transaction Model
const TransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    transactionId: { type: String, required: true, unique: true },
    merchantId: { type: String, required: true },
    items: {
      type: [CartSchema],
      validate: [
        (val: any[]) => val.length >= 1,
        "Order must contain at least one item",
      ],
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true },
);

// Order Model
const OrderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    items: {
      type: [CartSchema],
      validate: [
        (val: any[]) => val.length >= 1,
        "Order must contain at least one item",
      ],
    },
    shippingAddress: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "placed", "processing", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const checkoutSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    items: {
      type: [CartSchema],
      validate: [
        (val: any[]) => val.length >= 1,
        "Order must contain at least one item",
      ],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "EXPIRED"],
      default: "ACTIVE",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
  },
  { timestamps: true },
);

checkoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Brand = models.Brand || model("Brand", BrandSchema);
export const Category = models.Category || model("Category", CategorySchema);
export const Subcategory =
  models.Subcategory || model("Subcategory", SubcategorySchema);
export const User = models.User || model("User", UserSchema);
export const Product = models.Product || model("Product", ProductSchema);
export const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);
export const Order = models.Order || model("Order", OrderSchema);
export const CheckoutSession =
  models.CheckoutSession || model("CheckoutSession", checkoutSessionSchema);
export const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);
