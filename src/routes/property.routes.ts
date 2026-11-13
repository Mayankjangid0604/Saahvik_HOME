import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as prop from '../controllers/property/property.controller';
import { createPropertySchema, updatePropertySchema, createRoomSchema, updateRoomSchema, createBedSchema, updateBedSchema } from '../validation/property';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(prop.listProperties));
router.post('/', authorize('OWNER', 'WARDEN'), validate(createPropertySchema), asyncHandler(prop.createProperty));
router.get('/occupancy', asyncHandler(prop.getOccupancy));
router.get('/:propertyId', asyncHandler(prop.getProperty));
router.patch('/:propertyId', authorize('OWNER', 'WARDEN'), validate(updatePropertySchema), asyncHandler(prop.updateProperty));
router.post('/:propertyId/rooms', authorize('OWNER', 'WARDEN'), validate(createRoomSchema), asyncHandler(prop.createRoom));
router.patch('/:propertyId/rooms/:roomId', authorize('OWNER', 'WARDEN'), validate(updateRoomSchema), asyncHandler(prop.updateRoom));
router.post('/rooms/:roomId/beds', authorize('OWNER', 'WARDEN'), validate(createBedSchema), asyncHandler(prop.createBed));
router.patch('/beds/:bedId', authorize('OWNER', 'WARDEN'), validate(updateBedSchema), asyncHandler(prop.updateBed));

export default router;
