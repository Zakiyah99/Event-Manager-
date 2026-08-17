import { Search, Users } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import ClientCard from './ClientCard'

const ClientList = ({ clients = [], events = [], onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredClients = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return clients.filter((client) =>
            client.fullName?.toLowerCase().includes(term)
            || client.phone?.toLowerCase().includes(term)
            || client.email?.toLowerCase().includes(term)
            || client.address?.toLowerCase().includes(term)
        )
    }, [clients, searchTerm])

    const getEventCount = (clientId) => events.filter((event) =>
        event.client?._id === clientId || event.client === clientId
    ).length

    if (clients.length === 0) {
        return (
            <div className="text-center py-16 border rounded-xl bg-card">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-sm font-medium">No clients yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Add a client first, then create their event.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
                <Input
                    placeholder="Search clients by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredClients.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-card">
                    <p className="text-sm text-muted-foreground">No clients match your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client._id}
                            client={client}
                            eventCount={getEventCount(client._id)}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ClientList
