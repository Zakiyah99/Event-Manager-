import { Badge } from '@/components/ui/badge'
import { CalendarCheck, CalendarClock, CalendarX, Users } from 'lucide-react'
import React from 'react'
import { cn } from '../../lib/utils'

const CardStatus = ({ stats }) => {
    const cards = [
        {
            label: 'Total Events',
            value: stats?.totalEvents ?? 0,
            icon: CalendarCheck,
            accent: 'bg-slate-100 text-slate-700'
        },
        {
            label: 'Upcoming Events',
            value: stats?.upcomingEvents ?? 0,
            icon: CalendarClock,
            accent: 'bg-blue-100 text-blue-700'
        },
        {
            label: 'Completed Events',
            value: stats?.completedEvents ?? 0,
            icon: CalendarCheck,
            accent: 'bg-green-100 text-green-700'
        },
        {
            label: 'Cancelled Events',
            value: stats?.cancelledEvents ?? 0,
            icon: CalendarX,
            accent: 'bg-red-100 text-red-700'
        },
        {
            label: 'Total Clients',
            value: stats?.totalClients ?? 0,
            icon: Users,
            accent: 'bg-indigo-100 text-indigo-700'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div key={card.label} className="bg-card rounded-xl border shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
                        </div>
                        <div className={cn('rounded-lg p-2', card.accent)}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </div>
                    <Badge variant="secondary" className="mt-4 font-normal">Live</Badge>
                </div>
            ))}
        </div>
    )
}

export default CardStatus
