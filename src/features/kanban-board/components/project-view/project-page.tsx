import { ProjectCard } from "./projects-card";

const ProjectPage = () => {
  const mockProjects = [
    {
      id: "1",
      title: "Figma Design System",
      status: "In Progress" as const,
      statusColor: "yellow" as const,
      borderColor: "yellow" as const,
      deadline: "Nov 15, 2026",
      progress: 65,
      teamMembers: [
        {
          name: "Alice",
          avatar: "https://github.com/shadcn.png",
        },
        {
          name: "Bob",
          avatar: "https://github.com/shadcn.png",
        },
        {
          name: "Charlie",
          avatar: "https://github.com/shadcn.png",
        },
      ],
      tasks: 24,
      activities: 128,
      client: "Acme Inc.",
      ProjectCoordinator: "Arjun",
      startDate: "Oct 1, 2026",
      priority: "High" as const,
      priorityColor: "red" as const,
    },
    {
      id: "2",
      title: "Keep React",
      status: "Planning" as const,
      statusColor: "blue" as const,
      borderColor: "blue" as const,
      deadline: "Dec 5, 2026",
      progress: 25,
      teamMembers: [
        {
          name: "David",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        },
        {
          name: "Emma",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        },
        {
          name: "Frank",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Frank",
        },
      ],
      tasks: 18,
      activities: 86,
      client: "TechCorp",
      ProjectCoordinator: "Dipen",
      startDate: "Oct 15, 2026",
      priority: "Medium" as const,
      priorityColor: "yellow" as const,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectPage;
