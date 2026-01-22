import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconFileTextFilled } from "@tabler/icons-react";
import {
  Briefcase,
  Calendar,
  Clock,
  Download,
  Flag,
  TrendingUp,
  User,
} from "lucide-react";

const OverviewProject = () => {
  return (
    <div>
      {" "}
      <Card className="mb-3">
        <div className="p-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Project Details (Advertisement Scrapper )
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Client: Devstree Product
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Briefcase size={16} />
                <h3 className="ml-2">Project Type</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>Fixed</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <User size={16} />
                <h3 className="ml-2">Project Coordinator</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>test TL</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Flag size={16} />
                <h3 className="ml-2">Priority</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full capitalize bg-green-100 text-green-800">
                  low
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Calendar size={16} />
                <h3 className="ml-2">Start Date</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>2025-07-31</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Clock size={16} />
                <h3 className="ml-2">Expected Completion</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>-</p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                <TrendingUp size={16} className="mr-2" />
                Progress
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `35%` }}
                ></div>
              </div>
              <p className="text-right text-sm font-semibold text-blue-600 mt-1">
                70%
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <div className="flex flex-col">
                <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-file-text"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                  <h3 className="ml-2">Description</h3>
                </div>
                <div className="text-base text-gray-800 pl-6">
                  <p className="whitespace-pre-wrap break-words text-gray-700">
                    Easyprops Classified Ads Data Generation{" "}
                  </p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <div className="flex flex-col">
                <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-code"
                  >
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <h3 className="ml-2">Technologies</h3>
                </div>
                <div className="text-base text-gray-800 pl-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                      Android
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                      AI/ML
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewProject;
