
import { LoginForm } from './user-auth-form'

const SignInSection = () => {
    return (
        <div className='lg:p-8 bg-accent-foreground h-screen grid place-items-center'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
                <div className='flex flex-col space-y-2 text-left'>
                    <h1 className='text-2xl  text-secondary'>Login</h1>
                    <p className='text-muted-foreground text-sm'>  </p>
                </div>
                <LoginForm />
            </div>
        </div>
    )
}

export default SignInSection