// src/components/Dashboard.jsx
import React, { useMemo } from "react";

/* format DD/MM/YYYY, hh:mm AM/PM */
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

export default function Dashboard({ tasks = [], onCardClick = () => {}, onOpenSettings }) {
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
          // add only upcoming within 7 days
          if (fd >= now && fd <= endOfWeek) {
            upcoming.push({ ...f, taskName: t.name, when: dateStr });
          }
        }
      }

      // include task.followUpDate as a follow-up candidate as well
      if (t.followUpDate) {
        const fd = new Date(t.followUpDate);
        totalFollowUps += 0; // already counted in fus if duplicated
        if (fd >= now && fd <= endOfWeek) {
          upcoming.push({ title: "Next (task)", notes: t.notes || "", taskName: t.name, when: t.followUpDate });
        }
      }
    }

    upcoming.sort((a,b) => new Date(a.when) - new Date(b.when));

    return { todays, week, totalFollowUps, pending, completed, upcoming };
  }, [tasks, now, startOfToday, endOfWeek]);

  return (
    <div className="dashboard" role="main">
      <header className="dashboard-header">
        <div className="header-left">
          {/* left menu placeholder (App.jsx will render MenuModal and manage open state);
              this is a visual placeholder in the header */}
          <div className="menu-left-placeholder" />
        </div>

        <h1 className="dashboard-title">Dashboard</h1>

        <div className="header-right">
          <button className="header-version" title="App version">v1.0.0</button>
          <button className="header-more" aria-hidden>⋯</button>
        </div>
      </header>

      <div className="dashboard-cards" role="region" aria-label="stats">
        <div className="card clickable" onClick={() => onCardClick("today")}>
          <div className="card-title">Today's tasks</div>
          <div className="card-value">{stats.todays}</div>
        </div>

        <div className="card clickable" onClick={() => onCardClick("week")}>
          <div className="card-title">Tasks this week</div>
          <div className="card-value">{stats.week}</div>
        </div>

        <div className="card clickable" onClick={() => onCardClick("followups")}>
          <div className="card-title">Total follow-ups</div>
          <div className="card-value">{stats.totalFollowUps}</div>
        </div>

        <div className="card clickable" onClick={() => onCardClick("pending")}>
          <div className="card-title">Pending / Completed</div>
          <div className="card-value">{stats.pending}/{stats.completed}</div>
        </div>
      </div>

      <section className="upcoming" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="upcoming-title">Upcoming (7 days)</h2>

        {stats.upcoming.length === 0 ? (
          <div className="no-upcoming">No upcoming follow-ups</div>
        ) : (
          <div className="upcoming-list">
            {stats.upcoming.map((u, idx) => (
              <div className="upcoming-row" key={idx}>
                <div className="upcoming-left">
                  <div className="upcoming-task">{u.taskName}</div>
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
