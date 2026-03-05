import useDebounce from "@/hooks/use-debaunce";
import { useState } from "react";
import PageLayout from "@/components/layout/layout-provider";
import MeetingsOverviewTab from "./components/meetings-overviewTab";

const MeetingsOverviewPage = () => {
  const [search, _] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  return (
    <PageLayout noPadding>
      <div className="flex-1 min-h-0 h-[calc(100vh-180px)]">
        <MeetingsOverviewTab search={debouncedSearch} />
      </div>
    </PageLayout>
  );
};

export default MeetingsOverviewPage;
