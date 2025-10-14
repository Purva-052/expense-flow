/* eslint-disable @typescript-eslint/no-explicit-any */
const SystemOverviewCard = ({ title, value, color }: any) => (
  <div className='text-center'>
    <div className={`mb-2 text-2xl font-bold ${color}`}>{value}</div>
    <p className='text-sm text-gray-600'>{title}</p>
  </div>
)

export default SystemOverviewCard
