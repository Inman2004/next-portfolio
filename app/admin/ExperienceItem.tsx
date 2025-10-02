'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { updateExperience, deleteExperience } from './actions';
import { ExperienceType } from '@/data/experiences';

export function ExperienceItem({ experience }: { experience: ExperienceType }) {
  const [isEditing, setIsEditing] = useState(false);

  const updateExperienceWithId = updateExperience.bind(null, experience.id);
  const [state, formAction] = useFormState(updateExperienceWithId, { message: '' });

  return (
    <div className="p-4 border rounded-lg">
      {!isEditing ? (
        <div>
          <h4 className="text-lg font-bold">{experience.role} at {experience.company}</h4>
          <p className="text-sm text-gray-500">{experience.startDate} - {experience.endDate}</p>
          <div className="mt-4 space-x-2">
            <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Edit
            </button>
            <button onClick={() => deleteExperience(experience.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <h3 className="text-xl font-semibold">Edit Experience</h3>

          <div>
            <label htmlFor={`role-${experience.id}`} className="block text-sm font-medium text-gray-700">Role</label>
            <input type="text" id={`role-${experience.id}`} name="role" defaultValue={experience.role} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor={`company-${experience.id}`} className="block text-sm font-medium text-gray-700">Company</label>
            <input type="text" id={`company-${experience.id}`} name="company" defaultValue={experience.company} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor={`location-${experience.id}`} className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id={`location-${experience.id}`} name="location" defaultValue={experience.location} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor={`startDate-${experience.id}`} className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="text" id={`startDate-${experience.id}`} name="startDate" defaultValue={experience.startDate} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor={`endDate-${experience.id}`} className="block text-sm font-medium text-gray-700">End Date</label>
            <input type="text" id={`endDate-${experience.id}`} name="endDate" defaultValue={experience.endDate} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor={`description-${experience.id}`} className="block text-sm font-medium text-gray-700">Description (one per line)</label>
            <textarea id={`description-${experience.id}`} name="description" rows={4} defaultValue={experience.description.join('\n')} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          <div>
            <label htmlFor={`skills-${experience.id}`} className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <input type="text" id={`skills-${experience.id}`} name="skills" defaultValue={experience.skills.join(',')} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor={`status-${experience.id}`} className="block text-sm font-medium text-gray-700">Status (comma-separated)</label>
            <input type="text" id={`status-${experience.id}`} name="status" defaultValue={experience.status.join(',')} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div className="flex space-x-2">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Update Experience
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
          </div>

          {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
        </form>
      )}
    </div>
  );
}