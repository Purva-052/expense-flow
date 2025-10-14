import { Main } from './main'

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Main>
      <div className='rounded-lg bg-white p-6 shadow-md'>{children}</div>
    </Main>
  )
}

export default PageLayout
