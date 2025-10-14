import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/use-auth-store'

export default function UnauthorizedError() {
    const { user } = useAuthStore()
    const dashboardPath =
    user?.role === 'master-admin'
      ? '/'
      : user?.role === 'club-admin'
      ? '/'
      : '/sign-in' // fallback if no role
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Error 403 - Forbidden
          </div>
          <div className="flex flex-col space-y-2">
            <Button asChild>
            <Link to={dashboardPath}>
                Go to Dashboard
              </Link>
            </Button>
            {/* <Button variant="outline" asChild>
              <Link to="/settings">
                Contact Support
              </Link>
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 