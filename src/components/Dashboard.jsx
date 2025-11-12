// src/components/Dashboard.jsx
import React, { useMemo } from "react";

/* date formatter DD/MM/YYYY, hh:mm AM/PM */
const fmtShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${day}/${month}/${year}, ${hour12}:${minutes} ${ampm}`;
};

export default function Dashboard({ tasks = [], onCardClick = () => {} }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

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
        const dateStr = f.date;
        if (dateStr) {
          const fd = new Date(dateStr);
          if (fd >= now && fd <= endOfWeek) {
            upcoming.push({ ...f, taskName: t.name || "", when: dateStr });
          }
        }
      }

      if (t.followUpDate) {
        const fd = new Date(t.followUpDate);
        if (fd >= now && fd <= endOfWeek) {
          upcoming.push({ title: "Next (task)", notes: t.notes || "", taskName: t.name || "", when: t.followUpDate });
        }
      }
    }

    upcoming.sort((a,b) => new Date(a.when) - new Date(b.when));
    return { todays, week, totalFollowUps, pending, completed, upcoming };
  }, [tasks, now, startOfToday, endOfWeek]);

  return (
    <div className="dashboard-screen">
      <div className="search-wrap">
        <input className="search-input" placeholder="Search by name / project / department" />
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => onCardClick("today")}>
          <div className="stat-title">Today's Tasks</div>
          <div className="stat-value">{stats.todays}</div>
        </div>

        <div className="stat-card" onClick={() => onCardClick("pending")}>
          <div className="stat-title">Pending Tasks</div>
          <div className="stat-value">{stats.pending}</div>
        </div>

        <div className="stat-card" onClick={() => onCardClick("completed")}>
          <div className="stat-title">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>

        <div className="stat-card" onClick={() => onCardClick("overdue")}>
          <div className="stat-title">Overdue</div>
          <div className="stat-value">
            {/* Overdue count: follow-ups with date < now and status still pending */}
            { (tasks || []).reduce((acc, t) => {
                const fus = t.followUps || [];
                const overdue = fus.filter(fu => fu.date && new Date(fu.date) < new Date() && (fu.status||"Pending")==="Pending").length;
                return acc + overdue;
              }, 0)
            }
          </div>
        </div>
      </div>

      <div className="filters-row">
        <select className="filter-select"><option>All Projects</option></select>
        <select className="filter-select"><option>All Departments</option></select>
        <select className="filter-select"><option>All Statuses</option></select>
        <div style={{flex:1}}></div>
      </div>

      <section className="upcoming-section">
        <h3 className="upcoming-heading">Upcoming (7 days)</h3>

        {stats.upcoming.length === 0 ? (
          <div className="no-upcoming small">No upcoming follow-ups</div>
        ) : (
          <div className="upcoming-list">
            {stats.upcoming.map((u, i) => (
              <div className="upcoming-row" key={i}>
                <div className="upcoming-left">
                  <div className="upcoming-task">{u.taskName || u.title || "Untitled"}</div>
                  <div className="upcoming-note">{u.title ? u.title : (u.notes || "")}</div>
                </div>
                <div className="upcoming-right">
                  <div className="upcoming-date">{fmtShort(u.when)}</div>
                  <div className="upcoming-status">{u.status || "Pending"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
