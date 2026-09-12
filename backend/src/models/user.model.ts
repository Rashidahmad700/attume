import bcrypt from 'bcryptjs';
import mongoose, { Schema, type HydratedDocument, type Model, type Types } from 'mongoose';

export type UserRole = 'customer' | 'admin';

export interface IAddress {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  /** DocumentArray so each entry keeps _id, set() and deleteOne(). */
  addresses: Types.DocumentArray<IAddress>;
  role: UserRole;
  /** Incremented on sign-out and password change to cut existing sessions. */
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, trim: true, maxlength: 40 },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    addresses: { type: [addressSchema], default: [] },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.tokenVersion;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  // A new password must not leave old sessions alive.
  if (!this.isNew) this.tokenVersion += 1;
  next();
});

userSchema.method('comparePassword', function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
});

export const User =
  (mongoose.models.User as UserModel) ??
  mongoose.model<IUser, UserModel>('User', userSchema);
