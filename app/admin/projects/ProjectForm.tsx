'use client';

import { useFormState } from 'react-dom';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';

const initialState = {
  message: '',
};

type ProjectFormProps = {
  action: (formData: FormData) => Promise<any>;
  project?: Project;
};

export function ProjectForm({ action, project }: ProjectFormProps) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
        <input type="text" id="title" name="title" defaultValue={project?.title} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={project?.description} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white"></textarea>
      </div>

      <div>
        <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Technologies (comma-separated)</label>
        <input type="text" id="technologies" name="technologies" defaultValue={project?.technologies.join(',')} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
        <input type="url" id="github" name="github" defaultValue={project?.github} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="live" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Live URL</label>
        <input type="url" id="live" name="live" defaultValue={project?.live} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Images (comma-separated URLs)</label>
        <input type="text" id="images" name="images" defaultValue={project?.images.join(',')} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
        <input type="text" id="startDate" name="startDate" defaultValue={project?.startDate} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
        <input type="text" id="endDate" name="endDate" defaultValue={project?.endDate} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-ray-300">Status</label>
        <select id="status" name="status" defaultValue={project?.status} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-black dark:text-white">
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
          <option value="deployed">Deployed</option>
          <option value="outdated">Outdated</option>
          <option value="in-progress">In Progress</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      <Button type="submit">{project ? 'Update Project' : 'Add Project'}</Button>

      {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
    </form>
  );
}