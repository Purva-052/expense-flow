/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const StatsCard = ({ title, value, icon, subtitle, onClick }: any) => (
  <Card
    className={`cursor-pointer transition-shadow hover:shadow-md`}
    onClick={onClick}
  >
    <CardHeader className='flex flex-row items-center justify-between pb-2'>
      <CardTitle className='text-sm font-medium text-gray-600'>
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className='text-3xl font-bold text-gray-900'>{value}</div>
      {subtitle && <p className='mt-2 text-sm text-gray-500'>{subtitle}</p>}
    </CardContent>
  </Card>
)

export default StatsCard
