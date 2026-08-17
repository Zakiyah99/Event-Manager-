import { useQuery } from '@tanstack/react-query'
import {
    CalendarDays,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Users,
    UserRound,
    X
} from 'lucide-react'
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api/apiClient'
import useAuthStore from '../../lib/store/authStore'
import { cn } from '../../lib/utils'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/guests', label: 'Guests', icon: UserRound },
    { to: '/settings', label: 'Settings', icon: Settings },
]

const AppLayout = ({ title, description, action, children }) => {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [mobileOpen, setMobileOpen] = useState(false);

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await api.get('/settings');
            return response.data;
        }
    })

    const appName = settingsQuery.data?.systemName || 'Event Manager';

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            clearAuth();
            queryClient.clear();
            navigate("/login", { replace: true });
        }
    }

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                    <CalendarDays className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-sidebar-foreground">{appName}</p>
                    <p className="text-xs text-muted-foreground">Event operations</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-sidebar-border px-4 py-4">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted/40">
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
                <SidebarContent />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <aside className="relative z-50 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-xl">
                        <button
                            className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3 min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="lg:hidden"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
                                {description && (
                                    <p className="text-sm text-muted-foreground truncate">{description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {action}
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default AppLayout
