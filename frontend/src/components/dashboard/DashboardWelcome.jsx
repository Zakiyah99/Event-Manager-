import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

const DashboardWelcome = ({ userName }) => {
    const navigate = useNavigate();

    return (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
            <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl text-white">
                            Welcome back{userName ? `, ${userName}` : ''}
                        </CardTitle>
                        <CardDescription className="text-slate-200 text-base">
                            Plan events, manage clients, and keep guest lists on track from one workspace.
                        </CardDescription>
                    </div>
                    <Button
                        className="bg-white text-slate-900 hover:bg-slate-100"
                        onClick={() => navigate('/events')}
                    >
                        Manage Events
                    </Button>
                </div>
            </CardHeader>
        </Card>
    )
}

export default DashboardWelcome
