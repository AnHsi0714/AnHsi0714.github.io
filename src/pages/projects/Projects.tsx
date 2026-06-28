import projectsData from "../../../content/projects.json";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";
import type { Project, ProjectStatus } from "../../types/content";

const projects = projectsData as Project[];

const statusLabel: Record<ProjectStatus, string> = {
  "in-progress": "doing",
  done: "done",
};

const statusBadgeVariant: Record<ProjectStatus, "doing" | "done"> = {
  "in-progress": "doing",
  done: "done",
};

export default function Projects() {
  return (
    <section>
      <h1 className="text-2xl font-bold">專案</h1>
      <p className="mt-2 text-neutral-600">做過、正在做的專案。</p>

      {projects.length === 0 ? (
        <EmptyState title="尚無專案" description="之後會陸續補上做過的專案。" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.name} hoverable>
              {project.screenshotUrl ? (
                <img
                  src={project.screenshotUrl}
                  alt={project.name}
                  className="aspect-video w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-md bg-neutral-100 text-sm text-neutral-400">
                  尚無預覽圖
                </div>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-semibold">{project.name}</p>
                <Badge
                  variant={statusBadgeVariant[project.status]}
                  className="shrink-0"
                >
                  {statusLabel[project.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                {project.desc}
              </p>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-neutral-500 hover:text-neutral-900"
                >
                  查看 GitHub →
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
