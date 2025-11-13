// src/components/Dashboard.jsx
import React, { useMemo } from "react";

/* small date formatter */
const fmtShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2,'0');
  const mon = String(d.getMonth()+1).padStart(2,'0');
  const yr = d.getFullYear();
  const hh = d.getHours() % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2,'0');
  const am = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${day}/${mon}/${yr}, ${hh}:${mm} ${am}`;
};

export default function Dashboard({ tasks = [], onCardClick = () => {} }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfToday); endOfWeek.setDate(endOfWeek.getDate()+7);

  const stats = useMemo(() => {
    let todays=0, week=0, totalFollowUps=0, pending=0, completed=0;
    const upcoming = [];
    for (const t of tasks) {
      const created = new Date(t.createdAt || 0);
      if (created >= startOfToday) todays++;
      if (created <= endOfWeek) week++;

      const fus = t.followUps || [];
      totalFollowUps += fus.length;
      for (const f of fus) {
        if ((f.status||'Pending') === 'Pending') pending++; else completed++;
        if (f.date) {
          const fd = new Date(f.date);
          if (fd >= now && fd <= endOfWeek) upcoming.push({ ...f, taskName: t.name, when: f.date });
        }
      }
      if (t.followUpDate) {
        const fd = new Date(t.followUpDate);
        if (fd >= now && fd <= endOfWeek) upcoming.push({ title: 'Next (task)', notes: t.notes || '', taskName: t.name, when: t.followUpDate });
      }
    }
    upcoming.sort((a,b)=> new Date(a.when)-new Date(b.when));
    return { todays, week, totalFollowUps, pending, completed, upcoming };
  }, [tasks, now, startOfToday, endOfWeek]);

  return (
    <div className="dashboard-screen">
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onCardClick('today')}><div className="stat-title">Today's Tasks</div><div className="stat-value">{stats.todays}</div></div>
        <div className="stat-card" onClick={() => onCardClick('week')}><div className="stat-title">Tasks this week</div><div className="stat-value">{stats.week}</div></div>
        <div className="stat-card" onClick={() => onCardClick('followups')}><div className="stat-title">Total follow-ups</div><div className="stat-value">{stats.totalFollowUps}</div></div>
        <div className="stat-card" onClick={() => onCardClick('pending')}><div className="stat-title">Pending / Completed</div><div className="stat-value">{stats.pending}/{stats.completed}</div></div>
      </div>

      <section className="upcoming-section">
        <h3 className="upcoming-heading">Upcoming (7 days)</h3>
        {stats.upcoming.length === 0 ? <div className="no-upcoming small">No upcoming follow-ups</div> : (
          <div className="upcoming-list">
            {stats.upcoming.map((u,i)=>(
              <div className="upcoming-row" key={i}>
                <div className="upcoming-left">
                  <div className="upcoming-task">{u.taskName || 'Untitled'}</div>
                  <div className="upcoming-note">{u.title || u.notes || ''}</div>
                </div>
                <div className="upcoming-right">
                  <div className="upcoming-date">{fmtShort(u.when)}</div>
                  <div className="upcoming-status">{u.status || 'Pending'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
