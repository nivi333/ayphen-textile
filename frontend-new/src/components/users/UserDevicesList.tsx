import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/globalComponents';
import { userService } from '@/services/userService';
import { format } from 'date-fns';
import { Loader2, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface UserDevicesListProps {
  userId: string;
}

interface Session {
  id: string;
  lastActive: string;
  createdAt: string;
  deviceType?: string;
}

export default function UserDevicesList({ userId }: UserDevicesListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const user = await userService.getUserById(userId);
        setSessions(user.sessions || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load active sessions');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className='flex justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Devices</CardTitle>
        <CardDescription>Currently active sessions for this user</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Started At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className='text-center text-muted-foreground h-24'>
                  No active sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Monitor className='h-4 w-4 text-muted-foreground' />
                      <span>Session {session.id.substring(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.lastActive), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{format(new Date(session.createdAt), 'MMM d, yyyy h:mm a')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </DataTable>
      </CardContent>
    </Card>
  );
}
