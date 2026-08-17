import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api/apiClient'
import { extractErrorMessages } from '../../util/errorUtils'
import { INVITATION_STATUSES, getEventName } from '../../lib/constants'

const emptyFormValues = {
    name: '',
    phone: '',
    event: '',
    numberOfPeople: 1,
    invitationStatus: 'Invited',
    notes: ''
}

const GuestForm = ({ guest, events = [], open = true, onOpenChange, defaultEventId = '' }) => {
    const [formValues, setFormValues] = useState(emptyFormValues)
    const [validationError, setValidationError] = useState(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (guest) {
            setFormValues({
                name: guest.name || '',
                phone: guest.phone || '',
                event: guest.event?._id || guest.event || '',
                numberOfPeople: guest.numberOfPeople || 1,
                invitationStatus: guest.invitationStatus || 'Invited',
                notes: guest.notes || ''
            });
        } else {
            setFormValues({ ...emptyFormValues, event: defaultEventId || '' });
        }
        setValidationError(null);
    }, [guest, open, defaultEventId])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }

    const createMutation = useMutation({
        mutationFn: async (data) => (await api.post('/guests', data)).data,
        onSuccess: () => {
            toast.success('Guest added successfully');
            queryClient.invalidateQueries({ queryKey: ['guests'] });
            onOpenChange?.(false);
            setFormValues(emptyFormValues);
        },
        onError: (error) => {
            setValidationError(extractErrorMessages(error));
            toast.error(`Error adding guest: ${extractErrorMessages(error)}`);
        }
    })

    const updateMutation = useMutation({
        mutationFn: async (data) => (await api.put(`/guests/${guest._id}`, data)).data,
        onSuccess: () => {
            toast.success('Guest updated successfully');
            queryClient.invalidateQueries({ queryKey: ['guests'] });
            onOpenChange?.(false);
            setFormValues(emptyFormValues);
        },
        onError: (error) => {
            setValidationError(extractErrorMessages(error));
            toast.error(`Error updating guest: ${extractErrorMessages(error)}`);
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formValues.name) {
            setValidationError('Guest name is required');
            return;
        }
        if (!formValues.event) {
            setValidationError('Event is required');
            return;
        }

        const payload = {
            name: formValues.name.trim(),
            phone: formValues.phone.trim(),
            event: formValues.event,
            numberOfPeople: Number(formValues.numberOfPeople) || 1,
            invitationStatus: formValues.invitationStatus,
            notes: formValues.notes.trim()
        }

        if (guest) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{guest ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
                    <DialogDescription>
                        Track invitation status and party size for this attendee.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {validationError && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {validationError}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Guest Name *</Label>
                        <Input id="name" name="name" value={formValues.name} onChange={handleInputChange} placeholder="Fatima Hassan" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" value={formValues.phone} onChange={handleInputChange} placeholder="+252 61xxxxxxx" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numberOfPeople">Number of People</Label>
                            <Input id="numberOfPeople" name="numberOfPeople" type="number" min="1" value={formValues.numberOfPeople} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Event *</Label>
                        <Select
                            value={formValues.event || undefined}
                            onValueChange={(value) => setFormValues({ ...formValues, event: value })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((event) => (
                                    <SelectItem key={event._id} value={event._id}>
                                        {getEventName(event)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Invitation Status</Label>
                        <Select
                            value={formValues.invitationStatus}
                            onValueChange={(value) => setFormValues({ ...formValues, invitationStatus: value })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INVITATION_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" value={formValues.notes} onChange={handleInputChange} placeholder="Dietary needs, plus-ones, seating..." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : guest ? 'Update Guest' : 'Add Guest'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default GuestForm
