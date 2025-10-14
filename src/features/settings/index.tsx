/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from '@/stores/use-auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageLayout from '@/components/layout/layout-provider'
import { Main } from '@/components/layout/main'
import { SettingsForm } from './components/SettingForm'
import { useGetSettingList } from './services'

const SettingPage = () => {
  const { data: listData, isPending: listDataLoading }: any =
    useGetSettingList()

  const { user } = useAuthStore()
  const role = user?.user?.role?.name

  if (listDataLoading) {
    return (
      <PageLayout>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='border-muted-foreground h-10 w-10 animate-spin rounded-full border-4 border-t-transparent'></div>
            <p className='text-muted-foreground'> Loading Venue Setting...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <Main>
      <div className='mx-auto mt-10 max-w-3xl p-8'>
        <Card className='border border-gray-200 shadow-lg'>
          <CardHeader>
            <CardTitle className='text-xl font-semibold'>
              {role === 'venue_owner' ? 'Venue Settings' : 'Admin Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm data={listData?.data} />
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

export default SettingPage
