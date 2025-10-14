import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
// import AuthLayout from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export default function ForgotPassword() {
  return (
    // <AuthLayout>
    <Card className='gap-4'>
      <CardHeader>
        <CardTitle className='text-lg tracking-tight'>
          Forgot Password
        </CardTitle>
        <CardDescription className='text-muted-foreground text-sm md:mb-5 lg:mb-6'>
          Enter your registered email and <br /> we will send you a OTP to reset
          your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
    // </AuthLayout>
  )
}
