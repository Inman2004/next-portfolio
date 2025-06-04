'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirebase } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

type DataItem = {
  id: string;
  [key: string]: any;
};

type CollectionData = {
  users: DataItem[];
  blogPosts: DataItem[];
  post_views: DataItem[];
  comments: DataItem[];
};

export default function AdminDataPage() {
  const [data, setData] = useState<CollectionData>({
    users: [],
    blogPosts: [],
    post_views: [],
    comments: []
  });
  const [activeTab, setActiveTab] = useState<keyof CollectionData>('users');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const auth = getAuth(getFirebase().app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) {
          console.error('User not authenticated');
          setLoading(false);
          return;
        }

        const db = getFirestore(getFirebase().app);
        const collections = ['blogPosts', 'post_views', 'comments'] as const;
        
        // Initialize data with empty arrays
        const newData: CollectionData = { 
          users: [], 
          blogPosts: [], 
          post_views: [], 
          comments: [] 
        };

        // Fetch all users from Firebase Auth
        try {
          const usersResponse = await fetch('/api/admin/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            newData.users = usersData;
          } else {
            console.error('Failed to fetch users:', await usersResponse.text());
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
        
        // Fetch other collections
        for (const col of collections) {
          try {
            const querySnapshot = await getDocs(collection(db, col));
            newData[col] = querySnapshot.docs.map(doc => {
              const data = doc.data();
              // Format dates for better display
              const formattedData: any = { id: doc.id };
              Object.entries(data).forEach(([key, value]) => {
                if (value?.toDate) {
                  formattedData[key] = value.toDate().toISOString();
                } else if (value && typeof value === 'object' && 'toDate' in value) {
                  formattedData[key] = value.toDate().toISOString();
                } else {
                  formattedData[key] = value;
                }
              });
              return formattedData;
            });
          } catch (error) {
            console.error(`Error fetching ${col}:`, error);
          }
        }
        
        setData(newData);
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (value.toDate) return value.toDate().toLocaleString();
    if (Array.isArray(value)) return `[${value.join(', ')}]`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentData = data[activeTab];
  const allKeys = Array.from(
    new Set(currentData.flatMap(item => Object.keys(item))))
    .filter(key => key !== 'id');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Firestore Data Explorer</h1>
      
      <div className="flex space-x-4 mb-6 border-b">
        {Object.keys(data).map((key) => (
          <button
            key={key}
            className={`py-2 px-4 ${
              activeTab === key ? 'border-b-2 border-blue-500' : ''
            }`}
            onClick={() => setActiveTab(key as keyof CollectionData)}
          >
            {key} ({data[key as keyof CollectionData].length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {currentData.length === 0 ? (
            <div className="p-4 text-gray-500">No {activeTab} found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  {allKeys.map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.id}
                    </td>
                    {allKeys.map((key) => (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs overflow-hidden overflow-ellipsis"
                        title={formatValue(item[key])}
                      >
                        {formatValue(item[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
