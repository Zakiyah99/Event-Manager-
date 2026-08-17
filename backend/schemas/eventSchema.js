import { z } from 'zod';
import { EVENT_STATUSES } from '../models/Event.js';

export const eventValidationSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
    eventType: z.string().min(1, 'Event type is required'),
    client: z.string().optional().or(z.literal('')),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().optional().or(z.literal('')),
    endTime: z.string().optional().or(z.literal('')),
    venue: z.string().min(1, 'Venue is required'),
    numberOfGuests: z.coerce.number().min(0).optional(),
    contactName: z.string().optional().or(z.literal('')),
    contactPhone: z.string().optional().or(z.literal('')),
    status: z.enum(EVENT_STATUSES).optional(),
    description: z.string().optional().or(z.literal('')),
    poster: z.string().optional().or(z.literal(''))
});

export const eventUpdateSchema = eventValidationSchema.partial();
