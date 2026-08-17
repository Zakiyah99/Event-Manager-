import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Loader, Plus } from 'lucide-react'
import React, { useState } from 'react'
import AppLayout from '../../components/dashboard/AppLayout'
import EventForm from '../../components/event/EventForm'
import EventList from '../../components/event/EventList'
import api from '../../lib/api/apiClient'

const EventsPage = () => {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)

    const handleFormClose = () => {
        setShowCreateForm(false)
        setEditingEvent(null)
    }

    const eventsQuery = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await api.get('/events');
            return response.data;
        },
        retry: 1,
    })

    const clientsQuery = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await api.get('/clients');
            return response.data;
        }
    })

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get('/settings');
            return response.data;
        }
    })

    if (eventsQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (eventsQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-red-500'>Error loading events: {eventsQuery.error.message}</p>
            </div>
        )
    }

    return (
        <AppLayout
            title="Events"
            description="Create, filter, and manage every event on the calendar."
            action={
                <Button onClick={() => { setEditingEvent(null); setShowCreateForm(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                </Button>
            }
        >
            <EventList
                events={eventsQuery.data || []}
                clients={clientsQuery.data || []}
                eventTypes={settingsQuery.data?.eventTypes || []}
                onEdit={(event) => {
                    setEditingEvent(event)
                    setShowCreateForm(true)
                }}
            />

            <EventForm
                event={editingEvent}
                open={showCreateForm || !!editingEvent}
                onOpenChange={handleFormClose}
            />
        </AppLayout>
    )
}

export default EventsPage
