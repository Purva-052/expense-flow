import React from "react";

const HoursLogs = () => {
  return (
    <div>
      {" "}
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-6 py-3 border-b flex justify-between">
            <h4 className="font-semibold text-slate-900">
              Saturday, January 20, 2024
            </h4>
            <p className="text-sm text-slate-600 mt-1">Total: 5.5 hours</p>
          </div>
          <div className="divide-y">
            <div className="px-2 py-2 hover:bg-slate-50 transition-colors flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <span
                  data-slot="avatar"
                  className="relative flex size-8 shrink-0 overflow-hidden rounded-full h-10 w-10 mt-1"
                >
                  <span
                    data-slot="avatar-fallback"
                    className="flex size-full items-center justify-center rounded-full bg-blue-500 text-white font-semibold"
                  >
                    JD
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">John Doe</p>
                </div>
              </div>
              <div className="ml-4 text-right flex-shrink-0">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-lg">
                  3h
                </div>
              </div>
            </div>
            <div className="px-2 py-2 hover:bg-slate-50 transition-colors flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <span
                  data-slot="avatar"
                  className="relative flex size-8 shrink-0 overflow-hidden rounded-full h-10 w-10 mt-1"
                >
                  <span
                    data-slot="avatar-fallback"
                    className="flex size-full items-center justify-center rounded-full bg-blue-500 text-white font-semibold"
                  >
                    JD
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">John Doe</p>
                </div>
              </div>
              <div className="ml-4 text-right flex-shrink-0">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-lg">
                  3h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursLogs;
