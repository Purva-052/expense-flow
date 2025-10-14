import LoginImage from '@/assets/login.png'

const SignInLeftSection = () => {
  return (
    <div className='bg-gray-50 relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
      <img
        src={LoginImage}
        className='relative m-auto mix-blend-darken'
        width={'100%'}
        height={'100%'}
        alt='Vite'
      />
    </div>
  )
}

export default SignInLeftSection
