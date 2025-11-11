
import React from "react";

const Dashboard = ({ tasks }) => {
  return (
    <div className="dashboard">
      <h2 className="task-header">Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>
        <div className="card">
          <h3>Total Follow-Ups</h3>
          <p>{tasks.reduce((a, t) => a + (t.followUps?.length || 0), 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
