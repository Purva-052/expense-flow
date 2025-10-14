/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { z } from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, Building2, Lock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import PageLayout from '@/components/layout/layout-provider'
import { Main } from '@/components/layout/main'
import FormPasswordField from '../auth/sign-in/components/form-password-field'
import { useGetUserProfileData, useUpdatePassword } from './services'

// ✅ Password validation schema
const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please re-enter your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const ProfilePage = () => {
  const [openDialog, setOpenDialog] = useState(false)

  // ✅ Form hook and logic
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })

  const { handleSubmit, reset } = form

  const onsuccessUpdatePassword = () => {
    setOpenDialog(false)
    reset()
  }
  const { mutateAsync: updatePassword, isPending: updatePasswordLoading } =
    useUpdatePassword(onsuccessUpdatePassword)
  const { data: userData, isPending: ProfileLoading }: any =
    useGetUserProfileData()

  const profile = userData?.data

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      updatePassword({
        newPassword: values.newPassword,
      })
    } catch (error: any) {
      throw new Error(error)
    }
  }

  if (ProfileLoading) {
    return (
      <PageLayout>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='border-muted-foreground h-10 w-10 animate-spin rounded-full border-4 border-t-transparent'></div>
            <p className='text-muted-foreground'> Loading Profile details...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <Main>
      <div className='container mx-auto max-w-5xl space-y-8 py-12'>
        {/* -- Page Header -- */}
        <div className='flex items-center gap-4'>
          <Avatar className='h-24 w-24 border'>
            <AvatarImage src={profile?.image} alt={profile?.name} />
            <AvatarFallback className='text-3xl'>
              {profile?.name
                ?.split(' ')
                .map((n: any) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {profile?.name}
            </h1>
            <p className='text-muted-foreground'>
              Manage your profile details and account settings.
            </p>
          </div>
        </div>

        {/* -- Single Card Layout -- */}
        <Card>
          {/* -- NEW: Header with flexbox for proper button alignment -- */}
          <CardHeader className='flex flex-row items-start justify-between'>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                This contains your personal and venue-related details.
              </CardDescription>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button variant='default' size='sm'>
                  <Lock className='mr-2 h-4 w-4' /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Update Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password below. Make sure it's a strong one!
                  </DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='space-y-4 py-4'>
                      <FormPasswordField
                        form={form}
                        name='newPassword'
                        label='New Password'
                      />
                      <FormPasswordField
                        form={form}
                        name='confirmPassword'
                        label='Confirm New Password'
                      />
                    </div>
                    <DialogFooter>
                      <Button type='submit' disabled={updatePasswordLoading}>
                        {updatePasswordLoading ? 'Updating...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className='space-y-6 pt-0'>
            <Separator />
            {/* Contact Section */}
            <div className='space-y-4'>
              <h3 className='font-semibold'>Contact Details</h3>
              <div className='flex items-center gap-4'>
                <Mail className='text-muted-foreground h-5 w-5' />
                <span className='text-sm'>{profile?.email}</span>
              </div>
              <div className='flex items-center gap-4'>
                <Phone className='text-muted-foreground h-5 w-5' />
                <span className='text-sm'>{profile?.phone}</span>
              </div>
            </div>
            {profile?.venue && (
              <>
                <Separator />
                {/* Venue Section */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-semibold'>Venue Details</h3>
                    <Badge
                      variant={
                        profile?.venue?.venueStripeConnectAccountActive
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {profile?.venue?.venueStripeConnectAccountActive
                        ? 'Stripe Connected'
                        : 'Not Connected'}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Building2 className='text-muted-foreground h-5 w-5' />
                    <span className='text-sm'>{profile?.venue?.name}</span>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Stripe Account ID
                    </p>
                    <p className='font-mono text-xs'>
                      {profile?.venue?.venueStripeConnectAccountId}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

export default ProfilePage
