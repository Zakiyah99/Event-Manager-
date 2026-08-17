import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Calendar, Edit2, Loader, MoreVertical, Phone, Trash, Users } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../../lib/api/apiClient'
import { extractErrorMessages } from '../../util/errorUtils'
import { formatDate, getEventName, statusBadgeClass } from '../../lib/constants'

const GuestCard = ({ guest, onEdit }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const queryClient = useQueryClient()
    const eventName = getEventName(guest.event)

    const deleteMutation = useMutation({
        mutationFn: async () => (await api.delete(`/guests/${guest._id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guests'] });
            toast.success('Guest removed');
        },
        onError: (error) => {
            toast.error(extractErrorMessages(error));
        }
    })

    return (
        <>
            <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg">{guest.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{eventName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={statusBadgeClass[guest.invitationStatus] || statusBadgeClass.Invited}>
                                {guest.invitationStatus}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(guest)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {guest.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{guest.phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{guest.numberOfPeople || 1} people</span>
                    </div>
                    {guest.event?.date && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(guest.event.date)}</span>
                        </div>
                    )}
                    {guest.notes && (
                        <p className="text-muted-foreground pt-2 border-t">{guest.notes}</p>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this guest?</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{guest.name}" will be removed from the guest list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default GuestCard
