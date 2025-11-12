import React, { useMemo } from "react";

const fmtShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${day}/${month}/${year}, ${hour12}:${minutes} ${ampm}`;
};

const Dashboard = ({ tasks = [], onCardClick = () => {} }) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfWeek = new Date(startOfToday); endOfWeek.setDate(endOfWeek.getDate() + 7);

  const stats = useMemo(() => {
    let todays = 0;
    let week = 0;
    let totalFollowUps = 0;
    let pending = 0;
    let completed = 0;
    const upcoming = [];

    for (const t of tasks) {
      const created = new Date(t.createdAt || 0);
      if (created >= startOfToday && created < endOfToday) todays++;
      if (created >= startOfToday && created <= endOfWeek) week++;

      const fus = t.followUps || [];
      totalFollowUps += fus.length;
      for (const f of fus) {
        if ((f.status || "Pending") === "Pending") pending++; else completed++;
        if (f.date) {
          const fd = new Date(f.date);
          if (fd >= now && fd <= endOfWeek) {
            upcoming.push({ ...f, taskName: t.name });
          }
        }
      }
    }
    return { todays, week, totalFollowUps, pending, completed, upcoming };
  }, [tasks, now, startOfToday, endOfWeek]);

  return (
    <div className="dashboard">
      <h2 className="task-header">Dashboard</h2>

      <div className="dashboard-cards">
        <div className="card clickable" onClick={() => onCardClick('today')}>
          <h3>Today's tasks</h3>
          <p>{stats.todays}</p>
        </div>
        <div className="card clickable" onClick={() => onCardClick('week')}>
          <h3>Tasks this week</h3>
          <p>{stats.week}</p>
        </div>
        <div className="card clickable" onClick={() => onCardClick('followups')}>
          <h3>Total follow-ups</h3>
          <p>{stats.totalFollowUps}</p>
        </div>
        <div className="card clickable" onClick={() => onCardClick('pending')}>
          <h3>Pending / Completed</h3>
          <p>{stats.pending} / {stats.completed}</p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ color: "#1e88e5" }}>Upcoming (7 days)</h3>
        {stats.upcoming.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No upcoming follow-ups</p>
        ) : (
          stats.upcoming.map((u, i) => (
            <div key={i} style={{ padding: 10, background: "#fff", borderRadius: 10, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{u.title || "Follow-Up"}</div>
                <div style={{ color: "#6b7280" }}>{u.taskName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#ef4444", fontWeight: 700 }}>{fmtShort(u.date)}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{u.status || "Pending"}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
