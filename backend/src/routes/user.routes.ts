import { Router } from 'express';
import {
  addAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
  updateProfile,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  addressSchema,
  addressUpdateSchema,
  profileUpdateSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(requireAuth);

router.patch('/me', validate(profileUpdateSchema), updateProfile);

router
  .route('/me/addresses')
  .get(listAddresses)
  .post(validate(addressSchema), addAddress);

router
  .route('/me/addresses/:addressId')
  .patch(validate(addressUpdateSchema), updateAddress)
  .delete(deleteAddress);

router.patch('/me/addresses/:addressId/default', setDefaultAddress);

export default router;
