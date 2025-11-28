import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

export function ProfileView() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

        <div className="px-6 pb-6">
          <div className="flex items-end space-x-4 -mt-16 mb-6">
            <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-white flex items-center justify-center">
              <User className="w-12 h-12 text-slate-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                Runner
              </h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
