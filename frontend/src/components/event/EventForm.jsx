import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Loader } from 'lucide-react'
import { toast } from 'sonner'
import api, { uploadImage } from '../../lib/api/apiClient'
import { EVENT_STATUSES, toDateInput } from '../../lib/constants'
import { extractErrorMessages } from '../../util/errorUtils'

const emptyFormValues = {
    name: '',
    eventType: '',
    client: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    numberOfGuests: '',
    contactName: '',
    contactPhone: '',
    status: 'Upcoming',
    description: '',
    poster: ''
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

const EventForm = ({ event, open = true, onOpenChange }) => {
    const [formValues, setFormValues] = useState(emptyFormValues)
    const [validationError, setValidationError] = useState(null)
    const [posterFile, setPosterFile] = useState(null)
    const [localPreview, setLocalPreview] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef(null)
    const queryClient = useQueryClient()

    const clientsQuery = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await api.get('/clients');
            return response.data;
        },
        enabled: open
    })

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get('/settings');
            return response.data;
        },
        enabled: open
    })

    useEffect(() => {
        if (event) {
            setFormValues({
                name: event.name || event.title || '',
                eventType: event.eventType || '',
                client: event.client?._id || event.client || '',
                date: toDateInput(event.date),
                startTime: event.startTime || '',
                endTime: event.endTime || '',
                venue: event.venue || event.location || '',
                numberOfGuests: event.numberOfGuests ?? '',
                contactName: event.contactName || '',
                contactPhone: event.contactPhone || '',
                status: event.status || 'Upcoming',
                description: event.description || '',
                poster: event.poster || ''
            });
        } else {
            setFormValues(emptyFormValues);
        }
        setPosterFile(null);
        setValidationError(null);
    }, [event, open])

    useEffect(() => {
        if (!posterFile) {
            setLocalPreview('');
            return;
        }
        const url = URL.createObjectURL(posterFile);
        setLocalPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [posterFile])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value
        })
    }

    const handlePosterChange = (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setValidationError('Poster must be a JPEG, PNG, WebP, or GIF image')
            return
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setValidationError('Poster image must be 10 MB or smaller')
            return
        }

        setValidationError(null)
        setPosterFile(file)
    }

    const handleRemovePoster = () => {
        setPosterFile(null)
        setFormValues({
            ...formValues,
            poster: ''
        })
    }

    const invalidateRelated = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['guests'] });
    }

    const createEventMutation = useMutation({
        mutationFn: async (eventData) => {
            const response = await api.post('/events', eventData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Event created successfully', { description: 'Your event has been scheduled.' });
            invalidateRelated();
            onOpenChange?.(false);
            setFormValues(emptyFormValues);
            setPosterFile(null);
        },
        onError: (error) => {
            toast.error(`Error creating event: ${extractErrorMessages(error)}`, { description: 'Please try again.' });
            setValidationError(extractErrorMessages(error));
        }
    })

    const updateEventMutation = useMutation({
        mutationFn: async (eventData) => {
            const response = await api.put(`/events/${event._id}`, eventData);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Event updated successfully', { description: 'Your event details have been saved.' });
            invalidateRelated();
            onOpenChange?.(false);
            setFormValues(emptyFormValues);
            setPosterFile(null);
        },
        onError: (error) => {
            toast.error(`Error updating event: ${extractErrorMessages(error)}`, { description: 'Please try again.' });
            setValidationError(extractErrorMessages(error));
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formValues.name) {
            setValidationError('Event name is required');
            return;
        }
        if (!formValues.eventType) {
            setValidationError('Event type is required');
            return;
        }
        if (!formValues.date) {
            setValidationError('Date is required');
            return;
        }
        if (!formValues.venue) {
            setValidationError('Venue is required');
            return;
        }

        let poster = formValues.poster || '';
        if (posterFile) {
            try {
                setIsUploading(true);
                const uploaded = await uploadImage(posterFile);
                poster = uploaded.fileUrl;
            } catch (error) {
                const message = extractErrorMessages(error);
                setValidationError(message);
                toast.error(`Error uploading poster: ${message}`, { description: 'Please try again.' });
                return;
            } finally {
                setIsUploading(false);
            }
        }

        const eventData = {
            name: formValues.name.trim(),
            eventType: formValues.eventType,
            client: formValues.client || '',
            date: `${formValues.date}T12:00:00`,
            startTime: formValues.startTime,
            endTime: formValues.endTime,
            venue: formValues.venue.trim(),
            numberOfGuests: Number(formValues.numberOfGuests) || 0,
            contactName: formValues.contactName.trim(),
            contactPhone: formValues.contactPhone.trim(),
            status: formValues.status,
            description: formValues.description.trim(),
            poster
        }

        if (event) {
            updateEventMutation.mutate(eventData);
        } else {
            createEventMutation.mutate(eventData);
        }
    }

    const displayError = validationError || extractErrorMessages(createEventMutation.error);
    const isLoading = createEventMutation.isPending || updateEventMutation.isPending || isUploading;
    const previewSrc = localPreview || formValues.poster;
    const eventTypes = settingsQuery.data?.eventTypes || [];
    const clients = clientsQuery.data || [];
    const typeOptions = [...eventTypes];
    if (formValues.eventType && !typeOptions.some((type) => type.name === formValues.eventType)) {
        typeOptions.unshift({ name: formValues.eventType, _id: 'current-type' });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {event ? 'Edit Event' : 'Create Event'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {event ? 'Update planning details for this event.' : 'Add a new event with client, venue, timing, and guest count.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {displayError && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {displayError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name">Event Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formValues.name}
                                onChange={handleInputChange}
                                placeholder="Ahmed & Amina Wedding"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Event Type *</Label>
                            <Select
                                value={formValues.eventType || undefined}
                                onValueChange={(value) => setFormValues({ ...formValues, eventType: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((type) => (
                                        <SelectItem key={type._id || type.name} value={type.name}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Select
                                value={formValues.client || 'none'}
                                onValueChange={(value) => setFormValues({ ...formValues, client: value === 'none' ? '' : value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No client</SelectItem>
                                    {clients.map((client) => (
                                        <SelectItem key={client._id} value={client._id}>
                                            {client.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formValues.date}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formValues.status}
                                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formValues.startTime}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                name="endTime"
                                type="time"
                                value={formValues.endTime}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="venue">Venue *</Label>
                            <Input
                                id="venue"
                                name="venue"
                                value={formValues.venue}
                                onChange={handleInputChange}
                                placeholder="Royal Palace"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numberOfGuests">Number of Guests</Label>
                            <Input
                                id="numberOfGuests"
                                name="numberOfGuests"
                                type="number"
                                min="0"
                                value={formValues.numberOfGuests}
                                onChange={handleInputChange}
                                placeholder="350"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Person</Label>
                            <Input
                                id="contactName"
                                name="contactName"
                                value={formValues.contactName}
                                onChange={handleInputChange}
                                placeholder="Ahmed Ali"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                value={formValues.contactPhone}
                                onChange={handleInputChange}
                                placeholder="+252 61xxxxxxx"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description / Notes</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formValues.description}
                                onChange={handleInputChange}
                                placeholder="Catering, stage setup, special requests..."
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="poster">Event Poster</Label>
                            {previewSrc ? (
                                <div className="relative overflow-hidden rounded-lg border bg-muted">
                                    <img
                                        src={previewSrc}
                                        alt="Event poster preview"
                                        className="h-48 w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                            Change
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={handleRemovePoster}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
                                >
                                    <ImageIcon className="h-8 w-8" />
                                    <span>Click to upload a poster</span>
                                    <span className="text-xs">JPEG, PNG, WebP, or GIF · max 10 MB</span>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                id="poster"
                                name="poster"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handlePosterChange}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    {isUploading ? 'Uploading poster...' : event ? 'Updating...' : 'Creating...'}
                                </span>
                            ) : (
                                event ? 'Update Event' : 'Create Event'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EventForm
