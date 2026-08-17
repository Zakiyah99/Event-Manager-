import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Calendar, Loader, MapPin } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router'
import AppLayout from '../../components/dashboard/AppLayout'
import CardStatus from '../../components/dashboard/CardStatus'
import DashboardWelcome from '../../components/dashboard/DashboardWelcome'
import api from '../../lib/api/apiClient'
import useAuthStore from '../../lib/store/authStore'
import { formatDate, formatTimeRange, getClientName, getEventName, getEventVenue, statusBadgeClass } from '../../lib/constants'

const DashboardPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const dashboardQuery = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await api.get('/dashboard');
            return response.data;
        },
        retry: 1,
    })

    if (dashboardQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (dashboardQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-red-500'>Error loading dashboard: {dashboardQuery.error.message}</p>
            </div>
        )
    }

    const stats = dashboardQuery.data || {};
    const recentEvents = stats.recentEvents || [];

    return (
        <AppLayout
            title="Dashboard"
            description="Overview of events, clients, and upcoming work."
        >
            <div className="space-y-6">
                <DashboardWelcome userName={user?.name} />
                <CardStatus stats={stats} />

                <section className="bg-card border rounded-xl shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <div>
                            <h2 className="text-lg font-semibold">Recent Events</h2>
                            <p className="text-sm text-muted-foreground">Latest events across every status.</p>
                        </div>
                        <button
                            className="text-sm font-medium text-primary hover:underline"
                            onClick={() => navigate('/events')}
                        >
                            View all
                        </button>
                    </div>

                    {recentEvents.length === 0 ? (
                        <div className="py-16 text-center">
                            <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-3 text-sm font-medium">No events yet</p>
                            <p className="mt-1 text-sm text-muted-foreground">Create a client, then schedule your first event.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentEvents.map((event) => (
                                <div key={event._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {event.poster && (
                                            <img
                                                src={event.poster}
                                                alt=""
                                                className="h-10 w-10 rounded-md object-cover shrink-0 bg-muted"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{getEventName(event)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {event.eventType || 'Event'} · {getClientName(event.client)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(event.date)}
                                        </span>
                                        {formatTimeRange(event.startTime, event.endTime) && (
                                            <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                                        )}
                                        {getEventVenue(event) && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {getEventVenue(event)}
                                            </span>
                                        )}
                                        <Badge className={statusBadgeClass[event.status] || statusBadgeClass.Draft}>
                                            {event.status || 'Draft'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    )
}

export default DashboardPage
