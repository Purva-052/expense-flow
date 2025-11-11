/* eslint-disable @typescript-eslint/no-explicit-any */

const getTypeBadgeClasses = (serverType: string) => {
  switch (serverType?.toLowerCase()) {
    case 'frontend':
      return 'bg-indigo-100 text-indigo-800';
    case 'backend':
      return 'bg-teal-100 text-teal-800';
    case 'database':
      return 'bg-amber-100 text-amber-800';
    case 'devops':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-gray-100 text-gray-800'; // Fallback for any other type
  }
};

const ServerDetailsCard = ({ server }: any) => {
  const { ipUrl, type, owner, serverId, status, ssl } = server;

  // Conditionally set classes based on the server status
  const isActive = status === 'Active';

  // Helper function to get badge colors based on server type

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-6 border-l-4 ${
        isActive ? 'border-green-500' : 'border-red-500'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 break-all">
          {ipUrl}
        </h3>
        <div title={status} className="flex gap-1 items-center">
          <span
            className={`px-2 py-1 text-xs font-bold leading-none rounded-full ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-gray-600">
        <div className="flex justify-between items-center">
          <span className="font-medium">Type:</span>
          {/* The type badge now uses the helper function for its colors */}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getTypeBadgeClasses(
              type
            )}`}
          >
            {type}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Owner:</span>
          <span>{owner}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Server ID:</span>
          <span className="font-mono text-sm">{serverId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">SSL:</span>
          <span>{ssl}</span>
        </div>
      </div>
    </div>
  );
};

export default ServerDetailsCard;
