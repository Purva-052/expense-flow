import { Main } from "./main";

const PageLayout = ({
  children,
  noPadding,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) => {
  return (
    <Main>
      <div
        className={`rounded-lg bg-white shadow-md ${noPadding ? "p-2" : "p-6"}`}
      >
        {children}
      </div>
    </Main>
  );
};

export default PageLayout;
