import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api/apiClient'
import { extractErrorMessages } from '../../util/errorUtils'
import { formatDate, statusBadgeClass } from '../../lib/constants'

const emptyFormValues = {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
}

const ClientForm = ({ client, relatedEvents = [], open = true, onOpenChange }) => {
    const [formValues, setFormValues] = useState(emptyFormValues)
    const [validationError, setValidationError] = useState(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        if (client) {
            setFormValues({
                fullName: client.fullName || '',
                phone: client.phone || '',
                email: client.email || '',
                address: client.address || '',
                notes: client.notes || ''
            });
        } else {
            setFormValues(emptyFormValues);
        }
        setValidationError(null);
    }, [client, open])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }

    const invalidateRelated = () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
    }

    const createMutation = useMutation({
        mutationFn: async (data) => (await api.post('/clients', data)).data,
        onSuccess: () => {
            toast.success('Client created successfully');
            invalidateRelated();
            onOpenChange?.(false);
            setFormValues(emptyFormValues);
        },
        onError: (error) => {
            setValidationError(extractErrorMessages(error));
            toast.error(`Error creating client: ${extractErrorMessages(error)}`);
        }
    })

    const updateMutation = useMutation({
        mutationFn: async (data) => (await api.put(`/clients/${client._id}`, data)).data,
        onSuccess: () => {
            toast.success('Client updated successfully');
            invalidateRelated();
            onOpenChange?.(false);
            setFormValues(emptyFormValues);
        },
        onError: (error) => {
            setValidationError(extractErrorMessages(error));
            toast.error(`Error updating client: ${extractErrorMessages(error)}`);
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formValues.fullName) {
            setValidationError('Full name is required');
            return;
        }
        if (!formValues.phone) {
            setValidationError('Phone is required');
            return;
        }

        const payload = {
            fullName: formValues.fullName.trim(),
            phone: formValues.phone.trim(),
            email: formValues.email.trim(),
            address: formValues.address.trim(),
            notes: formValues.notes.trim()
        }

        if (client) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{client ? 'Edit Client' : 'Add Client'}</DialogTitle>
                    <DialogDescription>
                        {client ? 'Update client details and review their events.' : 'Create a client before scheduling their event.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {validationError && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {validationError}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input id="fullName" name="fullName" value={formValues.fullName} onChange={handleInputChange} placeholder="Ahmed Ali" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input id="phone" name="phone" value={formValues.phone} onChange={handleInputChange} placeholder="+252 61xxxxxxx" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formValues.email} onChange={handleInputChange} placeholder="client@email.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" value={formValues.address} onChange={handleInputChange} placeholder="Mogadishu, Somalia" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" value={formValues.notes} onChange={handleInputChange} placeholder="Preferences, budget notes..." />
                    </div>

                    {client && (
                        <div className="space-y-2">
                            <Label>Their Events</Label>
                            {relatedEvents.length === 0 ? (
                                <p className="text-sm text-muted-foreground border rounded-md p-3">No events linked to this client yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {relatedEvents.map((event) => (
                                        <div key={event._id} className="flex items-center justify-between gap-3 border rounded-md p-3">
                                            <div>
                                                <p className="text-sm font-medium">{event.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(event.date)} · {event.venue}</p>
                                            </div>
                                            <Badge className={statusBadgeClass[event.status] || statusBadgeClass.Draft}>
                                                {event.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : client ? 'Update Client' : 'Create Client'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ClientForm
