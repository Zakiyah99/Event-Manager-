import { z } from 'zod';

export const clientValidationSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.union([z.string().email('Email must be valid'), z.literal('')]).optional(),
    address: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal(''))
});
