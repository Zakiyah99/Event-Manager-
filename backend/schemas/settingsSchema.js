import { z } from 'zod';

export const settingsValidationSchema = z.object({
    systemName: z.string().optional()
});

export const eventTypeValidationSchema = z.object({
    name: z.string().min(1, 'Event type name is required')
});

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Email must be valid').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
});
