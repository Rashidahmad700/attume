import { User, type UserDocument } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  AddressInput,
  AddressUpdateInput,
  ProfileUpdateInput,
} from '../validators/user.validator.js';

async function loadUser(id: string): Promise<UserDocument> {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

/** Keeps exactly one default: the newest flagged address wins. */
function applyDefault(user: UserDocument, addressId: string) {
  user.addresses.forEach((address) => {
    address.isDefault = address._id?.toString() === addressId;
  });
}

/** PATCH /api/v1/users/me */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body as ProfileUpdateInput;
  const user = await loadUser(req.user!.id);

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: { user: user.toJSON() },
  });
});

/** GET /api/v1/users/me/addresses */
export const listAddresses = asyncHandler(async (req, res) => {
  const user = await loadUser(req.user!.id);
  res.status(200).json({ success: true, data: { addresses: user.toJSON().addresses } });
});

/** POST /api/v1/users/me/addresses */
export const addAddress = asyncHandler(async (req, res) => {
  const payload = req.body as AddressInput;
  const user = await loadUser(req.user!.id);

  if (user.addresses.length >= 10) {
    throw ApiError.badRequest('You can save up to 10 addresses');
  }

  // First address is always the default, regardless of what was sent.
  const shouldBeDefault = payload.isDefault || user.addresses.length === 0;
  user.addresses.push({ ...payload, isDefault: shouldBeDefault });

  const created = user.addresses[user.addresses.length - 1];
  if (shouldBeDefault) applyDefault(user, created._id!.toString());

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added',
    data: { user: user.toJSON() },
  });
});

/** PATCH /api/v1/users/me/addresses/:addressId */
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const payload = req.body as AddressUpdateInput;
  const user = await loadUser(req.user!.id);

  const address = user.addresses.find((item) => item._id?.toString() === addressId);
  if (!address) throw ApiError.notFound('Address not found');

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'isDefault' || value === undefined) return;
    address.set(key, value);
  });

  if (payload.isDefault === true) applyDefault(user, addressId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated',
    data: { user: user.toJSON() },
  });
});

/** PATCH /api/v1/users/me/addresses/:addressId/default */
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await loadUser(req.user!.id);

  const exists = user.addresses.some((item) => item._id?.toString() === addressId);
  if (!exists) throw ApiError.notFound('Address not found');

  applyDefault(user, addressId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated',
    data: { user: user.toJSON() },
  });
});

/** DELETE /api/v1/users/me/addresses/:addressId */
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await loadUser(req.user!.id);

  const address = user.addresses.find((item) => item._id?.toString() === addressId);
  if (!address) throw ApiError.notFound('Address not found');

  const wasDefault = address.isDefault;
  address.deleteOne();

  // Never leave the book without a default.
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address removed',
    data: { user: user.toJSON() },
  });
});
