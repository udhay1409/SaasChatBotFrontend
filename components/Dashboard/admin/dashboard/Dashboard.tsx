import React from "react";


interface AdminDashboardProps {
  user?: unknown;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
