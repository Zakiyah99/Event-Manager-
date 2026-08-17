import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Loader, Plus } from 'lucide-react'
import React, { useState } from 'react'
import AppLayout from '../../components/dashboard/AppLayout'
import GuestForm from '../../components/guest/GuestForm'
import GuestList from '../../components/guest/GuestList'
import api from '../../lib/api/apiClient'

const GuestsPage = () => {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingGuest, setEditingGuest] = useState(null)

    const handleFormClose = () => {
        setShowCreateForm(false)
        setEditingGuest(null)
    }

    const guestsQuery = useQuery({
        queryKey: ['guests'],
        queryFn: async () => {
            const response = await api.get('/guests');
            return response.data;
        },
        retry: 1,
    })

    const eventsQuery = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await api.get('/events');
            return response.data;
        }
    })

    if (guestsQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (guestsQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-red-500'>Error loading guests: {guestsQuery.error.message}</p>
            </div>
        )
    }

    return (
        <AppLayout
            title="Guests"
            description="Invitation lists and attendance for each event."
            action={
                <Button onClick={() => { setEditingGuest(null); setShowCreateForm(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guest
                </Button>
            }
        >
            <GuestList
                guests={guestsQuery.data || []}
                events={eventsQuery.data || []}
                onEdit={(guest) => {
                    setEditingGuest(guest)
                    setShowCreateForm(true)
                }}
            />

            <GuestForm
                guest={editingGuest}
                events={eventsQuery.data || []}
                open={showCreateForm || !!editingGuest}
                onOpenChange={handleFormClose}
            />
        </AppLayout>
    )
}

export default GuestsPage
