import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader, Pencil, Plus, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import AppLayout from '../../components/dashboard/AppLayout'
import api from '../../lib/api/apiClient'
import useAuthStore from '../../lib/store/authStore'
import { extractErrorMessages } from '../../util/errorUtils'

const SettingsPage = () => {
    const { user, setAuth, token } = useAuthStore();
    const queryClient = useQueryClient();
    const [systemForm, setSystemForm] = useState({
        systemName: 'Event Manager'
    })
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    })
    const [newType, setNewType] = useState('')
    const [editingType, setEditingType] = useState(null)

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: async () => (await api.get('/settings')).data
    })

    useEffect(() => {
        if (settingsQuery.data) {
            setSystemForm({
                systemName: settingsQuery.data.systemName || 'Event Manager'
            })
        }
    }, [settingsQuery.data])

    useEffect(() => {
        if (user) {
            setProfileForm((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }))
        }
    }, [user])

    const saveSettingsMutation = useMutation({
        mutationFn: async (data) => (await api.put('/settings', data)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('System name saved');
        },
        onError: (error) => toast.error(extractErrorMessages(error))
    })

    const addTypeMutation = useMutation({
        mutationFn: async (name) => (await api.post('/settings/event-types', { name })).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setNewType('');
            toast.success('Event type added');
        },
        onError: (error) => toast.error(extractErrorMessages(error))
    })

    const updateTypeMutation = useMutation({
        mutationFn: async ({ id, name }) => (await api.put(`/settings/event-types/${id}`, { name })).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setEditingType(null);
            toast.success('Event type updated');
        },
        onError: (error) => toast.error(extractErrorMessages(error))
    })

    const deleteTypeMutation = useMutation({
        mutationFn: async (id) => (await api.delete(`/settings/event-types/${id}`)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Event type removed');
        },
        onError: (error) => toast.error(extractErrorMessages(error))
    })

    const profileMutation = useMutation({
        mutationFn: async (data) => (await api.put('/auth/profile', data)).data,
        onSuccess: (data) => {
            setAuth(data, token);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setProfileForm((prev) => ({ ...prev, password: '' }));
            toast.success('Profile updated');
        },
        onError: (error) => toast.error(extractErrorMessages(error))
    })

    if (settingsQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    const eventTypes = settingsQuery.data?.eventTypes || [];

    return (
        <AppLayout
            title="Settings"
            description="Event types, profile, and system name."
        >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Event Types</CardTitle>
                        <CardDescription>These types appear in the event form.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a type, e.g. Gala"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                            />
                            <Button
                                onClick={() => newType.trim() && addTypeMutation.mutate(newType.trim())}
                                disabled={addTypeMutation.isPending}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {eventTypes.map((type) => (
                                <div key={type._id} className="flex items-center gap-2 border rounded-md p-2">
                                    {editingType === type._id ? (
                                        <Input
                                            defaultValue={type.name}
                                            onBlur={(e) => {
                                                const name = e.target.value.trim();
                                                if (name && name !== type.name) {
                                                    updateTypeMutation.mutate({ id: type._id, name });
                                                } else {
                                                    setEditingType(null);
                                                }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="flex-1 text-sm font-medium px-2">{type.name}</p>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => setEditingType(type._id)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteTypeMutation.mutate(type._id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Profile</CardTitle>
                        <CardDescription>Update your name, email, and password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                value={profileForm.password}
                                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                placeholder="Leave blank to keep current password"
                            />
                        </div>
                        <Button
                            onClick={() => profileMutation.mutate({
                                name: profileForm.name,
                                email: profileForm.email,
                                password: profileForm.password || undefined
                            })}
                            disabled={profileMutation.isPending}
                        >
                            {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    )
}

export default SettingsPage
