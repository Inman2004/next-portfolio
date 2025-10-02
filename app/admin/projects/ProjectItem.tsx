'use client';

import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteProject } from './actions';

export function ProjectItem({ project }: { project: Project }) {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 flex justify-between items-center">
      <div>
        <h4 className="text-lg font-bold">{project.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
      </div>
      <div className="flex space-x-2">
        <Button asChild variant="outline">
          <Link href={`/admin/projects/edit/${project.id}`}>
            Edit
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            if (confirm('Are you sure you want to delete this project?')) {
              await deleteProject(project.id);
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}