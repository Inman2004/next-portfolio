'use client';

import { useFormState } from 'react-dom';
import { createExperience } from './actions';

const initialState = {
  message: '',
};

export function AddExperienceForm() {
  const [state, formAction] = useFormState(createExperience, initialState);

  return (
    <form action={formAction} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold">Add New Experience</h3>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
        <input type="text" id="role" name="role" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
        <input type="text" id="company" name="company" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input type="text" id="location" name="location" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
        <input type="text" id="startDate" name="startDate" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
        <input type="text" id="endDate" name="endDate" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (one per line)</label>
        <textarea id="description" name="description" rows={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
        <input type="text" id="skills" name="skills" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status (comma-separated)</label>
        <input type="text" id="status" name="status" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Add Experience
      </button>

      {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
    </form>
  );
}