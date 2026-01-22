import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconFileTextFilled } from "@tabler/icons-react";
import { Download } from "lucide-react";

const OverviewProject = () => {
  return (
    <div>
      {" "}
      <Card className="mb-3">
        <div className="flex flex-col space-y-1.5 p-2 ">
          <div className="text-2xl font-semibold leading-none tracking-tight">
            Project Description
          </div>
          <div className="text-sm text-muted-foreground">
            Detailed information about the project
          </div>
          <p className="text-sm mt-2">
            This is a comprehensive project aimed at ui component library for
            design system. The project involves multiple phases including
            research, design, development, testing, and deployment.
          </p>
          <p className="text-sm mt-2">
            This is a comprehensive project aimed at ui component library for
            design system. The project involves multiple phases including
            research, design, development, testing, and deployment.
          </p>
          <p className="text-sm mt-2">
            This is a comprehensive project aimed at ui component library for
            design system. The project involves multiple phases including
            research, design, development, testing, and deployment.
          </p>
          <p className="text-sm mt-2">
            This is a comprehensive project aimed at ui component library for
            design system. The project involves multiple phases including
            research, design, development, testing, and deployment.
          </p>
          <p className="text-sm mt-2">
            This is a comprehensive project aimed at ui component library for
            design system. The project involves multiple phases including
            research, design, development, testing, and deployment.
          </p>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col space-y-1.5 p-2 ">
          <div className="text-2xl font-semibold leading-none tracking-tight">
            Files
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="space-y-4 mt-3">
              <div className="flex items-center space-x-3 ">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <IconFileTextFilled className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Design System Components
                  </p>
                  <p className="text-xs text-muted-foreground">1.2 MB • PDF</p>
                </div>
                <Button className="w-8 h-8">
                  <Download className="w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewProject;
