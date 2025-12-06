import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useMutation, gql } from 'urql';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';


const MARK_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(notificationId: $id)
  }
`;

export function NotificationBell() {
    const { notifications, refetch } = useNotifications();
    const [, markRead] = useMutation(MARK_READ_MUTATION);

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    const handleMarkRead = async (id: string) => {
        await markRead({ id });
        refetch({ requestPolicy: 'network-only' });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map((notification: any) => (
                            <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start p-3" onClick={() => handleMarkRead(notification.id)}>
                                <div className="flex justify-between w-full">
                                    <span className={`text-sm ${!notification.isRead ? 'font-bold' : ''}`}>
                                        {notification.message}
                                    </span>
                                    {!notification.isRead && <span className="h-2 w-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {new Date(parseInt(notification.createdAt)).toLocaleDateString()}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
