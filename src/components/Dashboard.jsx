import React from "react";

const Dashboard = ({ tasks = [] }) => {
  const totalTasks = tasks.length;
  const totalFollowUps = tasks.reduce((sum, t) => sum + (t.followUps?.length || 0), 0);
  const pending = tasks.reduce(
    (sum, t) =>
      sum +
      (t.status === "Pending" ? 1 : 0) +
      (t.followUps?.filter((f) => f.status === "Pending").length || 0),
    0
  );
  const completed = totalTasks + totalFollowUps - pending;

  const upcoming = tasks.flatMap((t) =>
    (t.followUps || []).filter((f) => {
      if (!f.date) return false;
      const d = new Date(f.date);
      const now = new Date();
      const in7 = new Date();
      in7.setDate(now.getDate() + 7);
      return d >= now && d <= in7;
    })
  );

  return (
    <div className="dashboard">
      <h2 className="task-header">Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className="card">
          <h3>Total Follow-Ups</h3>
          <p>{totalFollowUps}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p>{completed}</p>
        </div>
      </div>

      <h3 style={{ marginTop: "20px", color: "#1e88e5" }}>Upcoming (7 days)</h3>
      {upcoming.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No upcoming follow-ups</p>
      ) : (
        <ul>
          {upcoming.map((f, i) => (
            <li key={i}>
              <strong>{f.title}</strong> –{" "}
              {new Date(f.date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
