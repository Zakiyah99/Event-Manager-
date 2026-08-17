import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';
import { Calendar, Clock, Edit2, Loader, MapPin, MoreVertical, Phone, Trash, Users } from 'lucide-react';
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api/apiClient';
import {
    EVENT_STATUSES,
    formatDate,
    formatTimeRange,
    getClientName,
    getEventName,
    getEventVenue,
    statusBadgeClass
} from '../../lib/constants';

const EventCard = ({ event, onEdit }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [posterError, setPosterError] = useState(false);
    const queryClient = useQueryClient();
    const eventName = getEventName(event);
    const venue = getEventVenue(event);

    useEffect(() => {
        setPosterError(false);
    }, [event.poster]);

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/events/${event._id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['guests'] });
            toast.success('Event deleted successfully');
        },
        onError: (error) => {
            toast.error(`Error deleting event: ${error.message}`);
        }
    })

    const statusMutation = useMutation({
        mutationFn: async (status) => {
            const response = await api.put(`/events/${event._id}`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Event status updated');
        },
        onError: (error) => {
            toast.error(`Error updating status: ${error.message}`);
        }
    })

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error("Error confirming delete:", error);
        }
    }

    return (
        <>
            <Card className="w-full overflow-hidden transition-shadow hover:shadow-md">
                {event.poster && !posterError && (
                    <div className="aspect-[16/9] w-full bg-muted">
                        <img
                            src={event.poster}
                            alt={`${eventName} poster`}
                            className="h-full w-full object-cover"
                            onError={() => setPosterError(true)}
                        />
                    </div>
                )}
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="text-lg leading-tight">{eventName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{event.eventType || 'Event'}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Badge className={statusBadgeClass[event.status] || statusBadgeClass.Draft}>
                                {event.status || 'Draft'}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(event)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {EVENT_STATUSES.map((status) => (
                                        <DropdownMenuItem
                                            key={status}
                                            onClick={() => statusMutation.mutate(status)}
                                        >
                                            Mark as {status}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {event.description && (
                        <p className='text-muted-foreground text-sm leading-relaxed line-clamp-2'>{event.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.date) || 'Date TBD'}</span>
                    </div>

                    {formatTimeRange(event.startTime, event.endTime) && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                        </div>
                    )}

                    {venue && (
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{venue}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{getClientName(event.client)} · {event.numberOfGuests || 0} guests</span>
                    </div>

                    {(event.contactName || event.contactPhone) && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{[event.contactName, event.contactPhone].filter(Boolean).join(' · ')}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{eventName}" and its guest list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default EventCard
