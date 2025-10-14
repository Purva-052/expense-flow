/* eslint-disable @typescript-eslint/no-explicit-any */
const QuickActionCard = ({
  title,
  description,
  icon,
  hoverClass,
  onClick,
}: any) => (
  <div
    className={`group cursor-pointer rounded-lg border p-4 transition-colors ${hoverClass}`}
    onClick={onClick}
  >
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='font-medium text-gray-900 group-hover:text-blue-700'>
          {title}
        </h3>
        <p className='mt-1 text-sm text-gray-600'>{description}</p>
      </div>
      <div>{icon}</div>
    </div>
  </div>
)

export default QuickActionCard
