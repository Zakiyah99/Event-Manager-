import { Search, UserRound } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import GuestCard from './GuestCard'
import { INVITATION_STATUSES, getEventName } from '../../lib/constants'

const GuestList = ({ guests = [], events = [], onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [eventFilter, setEventFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const filteredGuests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return guests.filter((guest) => {
            const matchesSearch = !term
                || guest.name?.toLowerCase().includes(term)
                || guest.phone?.toLowerCase().includes(term)
                || getEventName(guest.event).toLowerCase().includes(term);
            const eventId = guest.event?._id || guest.event;
            const matchesEvent = eventFilter === 'all' || eventId === eventFilter;
            const matchesStatus = statusFilter === 'all' || guest.invitationStatus === statusFilter;
            return matchesSearch && matchesEvent && matchesStatus;
        })
    }, [guests, searchTerm, eventFilter, statusFilter])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                    <Input
                        placeholder="Search guests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by event" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All events</SelectItem>
                        {events.map((event) => (
                            <SelectItem key={event._id} value={event._id}>{getEventName(event)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Invitation status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {INVITATION_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {filteredGuests.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-card">
                    <UserRound className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-sm font-medium">No guests found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {guests.length === 0
                            ? 'Add guests after creating an event.'
                            : 'Try a different search or filter.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredGuests.map((guest) => (
                        <GuestCard key={guest._id} guest={guest} onEdit={onEdit} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default GuestList
