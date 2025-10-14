
export const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => (
    <div
      key={i}
      className='absolute h-2 w-2 animate-pulse rounded-full'
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    />
  ))

  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {particles}
    </div>
  )
}