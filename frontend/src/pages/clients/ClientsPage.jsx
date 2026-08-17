import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Loader, Plus } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import AppLayout from '../../components/dashboard/AppLayout'
import ClientForm from '../../components/client/ClientForm'
import ClientList from '../../components/client/ClientList'
import api from '../../lib/api/apiClient'

const ClientsPage = () => {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingClient, setEditingClient] = useState(null)

    const handleFormClose = () => {
        setShowCreateForm(false)
        setEditingClient(null)
    }

    const clientsQuery = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await api.get('/clients');
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

    const relatedEvents = useMemo(() => {
        if (!editingClient) return [];
        return (eventsQuery.data || []).filter((event) =>
            event.client?._id === editingClient._id || event.client === editingClient._id
        )
    }, [editingClient, eventsQuery.data])

    if (clientsQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (clientsQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-red-500'>Error loading clients: {clientsQuery.error.message}</p>
            </div>
        )
    }

    return (
        <AppLayout
            title="Clients"
            description="People and organizations you plan events for."
            action={
                <Button onClick={() => { setEditingClient(null); setShowCreateForm(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Client
                </Button>
            }
        >
            <ClientList
                clients={clientsQuery.data || []}
                events={eventsQuery.data || []}
                onEdit={(client) => {
                    setEditingClient(client)
                    setShowCreateForm(true)
                }}
            />

            <ClientForm
                client={editingClient}
                relatedEvents={relatedEvents}
                open={showCreateForm || !!editingClient}
                onOpenChange={handleFormClose}
            />
        </AppLayout>
    )
}

export default ClientsPage
