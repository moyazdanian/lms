'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input'; 
import { Search } from 'lucide-react';
import { InstructorCard } from './page';


export default function InstructorsList({ instructors }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstructors = useMemo(() => {
    if (!searchTerm.trim()) return instructors;

    const lowercasedQuery = searchTerm.toLowerCase().trim();
    return instructors.filter((instructor) =>
      instructor.name.toLowerCase().includes(lowercasedQuery) ||
      instructor.title?.toLowerCase().includes(lowercasedQuery)
    );
  }, [instructors, searchTerm]);

  return (
    <div>
      <div className="relative max-w-md mx-auto md:mx-0 mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search instructors by name or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="text-gray-600 dark:text-gray-400 mb-4">
        Showing{' '}
        <span className="font-bold text-gray-900 dark:text-white">
          {filteredInstructors.length}
        </span>{' '}
        instructors {searchTerm && `matching "${searchTerm}"`}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredInstructors.map((instructor) => (
          <InstructorCard key={instructor.id} instructor={instructor} />
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No instructors found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}