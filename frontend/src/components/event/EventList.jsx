import { Calendar, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import EventCard from './EventCard'
import { EVENT_STATUSES, getClientName, getEventName, getEventVenue, toDateInput } from '../../lib/constants'

const EventList = ({ events = [], clients = [], eventTypes = [], onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [upcomingOnly, setUpcomingOnly] = useState(false);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const term = searchTerm.toLowerCase();
            const name = getEventName(event).toLowerCase();
            const venue = getEventVenue(event).toLowerCase();
            const clientName = getClientName(event.client).toLowerCase();
            const matchesSearch = !term
                || name.includes(term)
                || venue.includes(term)
                || clientName.includes(term)
                || (event.eventType || '').toLowerCase().includes(term)
                || (event.description || '').toLowerCase().includes(term);

            const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
            const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
            const matchesClient = clientFilter === 'all'
                || event.client?._id === clientFilter
                || event.client === clientFilter;
            const matchesDate = !dateFilter || toDateInput(event.date) === dateFilter;

            const matchesUpcoming = !upcomingOnly || (event.date && new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0)));

            return matchesSearch && matchesStatus && matchesType && matchesClient && matchesDate && matchesUpcoming;
        })
    }, [events, searchTerm, statusFilter, typeFilter, clientFilter, dateFilter, upcomingOnly])

    const counts = {
        all: events.length,
        Upcoming: events.filter((event) => event.status === 'Upcoming').length,
        'In Progress': events.filter((event) => event.status === 'In Progress').length,
        Completed: events.filter((event) => event.status === 'Completed').length,
        Cancelled: events.filter((event) => event.status === 'Cancelled').length,
        Draft: events.filter((event) => event.status === 'Draft').length,
    }

    const EventGrid = ({ items, emptyMessage }) => {
        if (items.length === 0) {
            return (
                <div className="text-center py-16 border rounded-xl bg-card">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-sm font-medium">No events found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((event) => (
                    <EventCard key={event._id} event={event} onEdit={onEdit} />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                    <Input
                        type="text"
                        placeholder="Search events, venues, or clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {EVENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {eventTypes.map((type) => (
                            <SelectItem key={type._id || type.name} value={type.name}>{type.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All clients</SelectItem>
                        {clients.map((client) => (
                            <SelectItem key={client._id} value={client._id}>{client.fullName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={upcomingOnly ? 'upcoming' : 'all'} onValueChange={(value) => setUpcomingOnly(value === 'upcoming')}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="When" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        <SelectItem value="upcoming">Upcoming dates</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-1">
                    {['all', 'Upcoming', 'In Progress', 'Completed', 'Cancelled', 'Draft'].map((tab) => (
                        <TabsTrigger key={tab} value={tab} className="flex items-center gap-2">
                            {tab === 'all' ? 'All' : tab}
                            <Badge variant="secondary">{counts[tab] || 0}</Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {['all', 'Upcoming', 'In Progress', 'Completed', 'Cancelled', 'Draft'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <EventGrid
                            items={tab === 'all' ? filteredEvents : filteredEvents.filter((event) => event.status === tab)}
                            emptyMessage={tab === 'all'
                                ? "Create a client, then add your first event to get started."
                                : `No ${tab.toLowerCase()} events match these filters.`}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default EventList
