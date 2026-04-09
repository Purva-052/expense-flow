import { Main } from "./main";

const PageLayout = ({
  children,
  noPadding,
  className,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}) => {
  return (
    <Main>
      <div
        className={`rounded-lg bg-white shadow-md ${noPadding ? "p-2" : "p-6"} ${className}`}
      >
        {children}
      </div>
    </Main>
  );
};

export default PageLayout;
