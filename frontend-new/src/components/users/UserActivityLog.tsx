import { useEffect, useState } from 'react';
import { Table, TableBody, TableRow, TableHead } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DataTable,
  TableCell as GlobalTableCell,
  TableHeader as GlobalTableHeader,
} from '@/components/globalComponents';
import { userService, UserActivity } from '@/services/userService';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserActivityLogProps {
  userId: string;
}

export default function UserActivityLog({ userId }: UserActivityLogProps) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserActivity(userId);
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
        toast.error('Failed to load user activity');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivity();
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
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent activity history for this user</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable>
          <Table>
            <TableHead>
              <TableRow>
                <GlobalTableHeader>Action</GlobalTableHeader>
                <GlobalTableHeader>Date & Time</GlobalTableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <GlobalTableCell colSpan={2} className='text-center text-muted-foreground h-24'>
                    No activity recorded
                  </GlobalTableCell>
                </TableRow>
              ) : (
                activities.map(activity => (
                  <TableRow key={activity.id}>
                    <GlobalTableCell className='font-medium'>{activity.type}</GlobalTableCell>
                    <GlobalTableCell>
                      {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                    </GlobalTableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTable>
      </CardContent>
    </Card>
  );
}
