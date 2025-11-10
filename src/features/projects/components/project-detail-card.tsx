/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Briefcase,
  Calendar,
  Clock,
  Code,
  FileText,
  Flag,
  TrendingUp,
  User,
} from 'lucide-react';

const getStatusBadge = (status: any) => {
  switch (status?.toLowerCase()) {
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'on hold':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityBadge = (priority: any) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DetailItem = ({ icon, label, children }: any) => (
  <div className="flex flex-col">
    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
      {icon}
      <h3 className="ml-2">{label}</h3>
    </div>
    <div className="text-base text-gray-800 pl-6">{children}</div>
  </div>
);
const ProjectDetails = ({ projectDetails }: any) => {
  const data = projectDetails?.data;

  return (
    <div className="bg-white p-6 my-5 rounded-lg shadow-md border border-gray-200 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {data?.name ?? 'Project Name'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Client: {data?.client?.name ?? '-'}
          </p>
        </div>
        <div
          className={`mt-3 sm:mt-0 px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(data?.currentStatus)}`}
        >
          {data?.currentStatus || 'Not specified'}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        <DetailItem icon={<Briefcase size={16} />} label="Project Type">
          <p>{data?.projectType?.name ?? '-'}</p>
        </DetailItem>

        <DetailItem icon={<User size={16} />} label="Project Coordinator">
          <p>{data?.projectHandler?.fullName ?? '-'}</p>
        </DetailItem>

        <DetailItem icon={<Flag size={16} />} label="Priority">
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getPriorityBadge(data?.priority)}`}
          >
            {data?.priority ?? '-'}
          </span>
        </DetailItem>

        <DetailItem icon={<Calendar size={16} />} label="Start Date">
          <p>{data?.startDate?.split('T')?.[0] ?? '-'}</p>
        </DetailItem>

        <DetailItem icon={<Clock size={16} />} label="Expected Completion">
          <p>{data?.expectedCompletionDate?.split('T')?.[0] ?? '-'}</p>
        </DetailItem>

        {/* Progress Bar */}
        <div className="lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Progress
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${data?.percentageComplete ?? 0}%` }}
            ></div>
          </div>
          <p className="text-right text-sm font-semibold text-blue-600 mt-1">
            {data?.percentageComplete ?? 0}%
          </p>
        </div>

        {/* Description */}
        <div className="md:col-span-2 lg:col-span-3">
          <DetailItem icon={<FileText size={16} />} label="Description">
            <p className="whitespace-pre-wrap break-words text-gray-700">
              {data?.description || 'No description provided'}
            </p>
          </DetailItem>
        </div>

        {/* Technologies */}
        <div className="md:col-span-2 lg:col-span-3">
          <DetailItem icon={<Code size={16} />} label="Technologies">
            {data?.technologies && data.technologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.technologies.map((tech: any) => (
                  <span
                    key={tech.id || tech}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 border border-gray-200"
                  >
                    {tech.name ?? tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No technologies listed</p>
            )}
          </DetailItem>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
