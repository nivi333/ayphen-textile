import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PrimaryButton,
  StatusBadge,
} from '@/components/globalComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { userService, UserDetail, UpdateProfileRequest } from '@/services/userService';
import { toast } from 'sonner';
import { Loader2, User, Shield, Activity, Smartphone, Info } from 'lucide-react';
import UserActivityLog from '@/components/users/UserActivityLog';
import UserDevicesList from '@/components/users/UserDevicesList';
import useAuth from '@/contexts/AuthContext';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function UserProfilePage() {
  // If verify userId is strictly required param or optional? AppRouter has /users/:userId and /profile
  // If /profile, we use current user. If /users/:userId, we use that userId.
  const { userId: paramUserId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const userId = paramUserId || currentUser?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserDetail | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!userId) {
      // Should not happen if protected route logic works, but safe guard
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getUserById(userId);
        setUserData(data);
        form.reset({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user profile');
        navigate('/users'); // Redirect to list if not found
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, form, navigate]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;

    try {
      const updateData: UpdateProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      // If we are editing someone else (admin view), we might use distinct update method vs profile
      // But typically updateProfile is for "me". If checking specific user, might need updateUser(id, data).
      // Let's assume generic updateUser works for both if we have permission.
      // However, userService has `updateProfile` (no ID arg) and `updateUser` (with ID).

      if (paramUserId) {
        await userService.updateUser(userId, updateData);
      } else {
        await userService.updateProfile(updateData);
      }

      toast.success('Profile updated successfully');

      // Refresh data
      const refreshedData = await userService.getUserById(userId);
      setUserData(refreshedData);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!userData) return null;

  const isOwnProfile = !paramUserId || paramUserId === currentUser?.id;

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          {isOwnProfile ? 'My Profile' : `${userData.firstName} ${userData.lastName}`}
        </PageTitle>
        <StatusBadge variant={userData.isActive ? 'success' : 'error'} className='ml-4'>
          {userData.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </PageHeader>

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='profile' className='flex items-center gap-2'>
            <User className='h-4 w-4' />
            Profile
          </TabsTrigger>
          <TabsTrigger value='security' className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            Security
          </TabsTrigger>
          <TabsTrigger value='activity' className='flex items-center gap-2'>
            <Activity className='h-4 w-4' />
            Activity
          </TabsTrigger>
          <TabsTrigger value='devices' className='flex items-center gap-2'>
            <Smartphone className='h-4 w-4' />
            Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 max-w-xl'>
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='John' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Doe' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled readOnly className='bg-muted' />
                        </FormControl>
                        <FormMessage />
                        <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                          <Info className='h-3 w-3' />
                          <span>Email cannot be changed. Contact admin for help.</span>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='+1234567890' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <PrimaryButton type='submit' disabled={isOwnProfile ? false : true}>
                    Save Changes
                  </PrimaryButton>
                  {!isOwnProfile && (
                    <p className='text-sm text-yellow-600 mt-2'>
                      * Only the user can update their own profile details directly. Admins use the
                      Users List.
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security'>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Placeholder for change password - often separate logic */}
                <div className='p-4 border rounded-lg bg-muted/20'>
                  <h4 className='font-medium mb-2'>Change Password</h4>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Update your password to keep your account secure.
                  </p>
                  <PrimaryButton variant='secondary'>Change Password</PrimaryButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity'>
          <UserActivityLog userId={userId!} />
        </TabsContent>

        <TabsContent value='devices'>
          <UserDevicesList userId={userId!} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
