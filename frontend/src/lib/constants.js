export const EVENT_STATUSES = ['Draft', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'];

export const INVITATION_STATUSES = ['Invited', 'Confirmed', 'Declined', 'Attended'];

export const statusBadgeClass = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
    Completed: 'bg-green-100 text-green-700 border-green-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
    Invited: 'bg-gray-100 text-gray-700 border-gray-200',
    Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    Declined: 'bg-red-100 text-red-700 border-red-200',
    Attended: 'bg-green-100 text-green-700 border-green-200',
};

export const toDateInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

export const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = Number(hours);
    if (Number.isNaN(hour)) return time;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes || '00'} ${suffix}`;
}

export const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '';
    if (startTime && endTime) return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    return formatTime(startTime || endTime);
}

export const getClientName = (client) => {
    if (!client) return 'No client';
    if (typeof client === 'string') return 'Client';
    return client.fullName || 'Client';
}

export const getEventName = (event) => event?.name || event?.title || 'Untitled event';

export const getEventVenue = (event) => event?.venue || event?.location || '';
