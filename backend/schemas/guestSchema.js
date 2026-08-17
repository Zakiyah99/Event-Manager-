import { z } from 'zod';
import { INVITATION_STATUSES } from '../models/Guest.js';

export const guestValidationSchema = z.object({
    name: z.string().min(1, 'Guest name is required'),
    phone: z.string().optional().or(z.literal('')),
    event: z.string().min(1, 'Event is required'),
    numberOfPeople: z.coerce.number().min(1).optional(),
    invitationStatus: z.enum(INVITATION_STATUSES).optional(),
    notes: z.string().optional().or(z.literal(''))
});
