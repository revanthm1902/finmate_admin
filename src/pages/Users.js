import React from 'react';
import UserManagement from '../components/UserManagement';

const Users = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and permissions</p>
      </div>

      <UserManagement />
    </div>
  );
};

export default Users;
