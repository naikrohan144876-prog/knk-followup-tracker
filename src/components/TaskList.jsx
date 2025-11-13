// src/components/TaskList.jsx
import React, { useMemo, useState } from "react";

/* helper: format dd/mm/yyyy, h:mm AM/PM */
const fmt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  const yr = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${day}/${mon}/${yr}, ${hour12}:${minutes} ${ampm}`;
};

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() &&
         d.getMonth() === t.getMonth() &&
         d.getDate() === t.getDate();
};

export default function TaskList({
  tasks = [],
  searchTerm = "",
  onOpenDetail = () => {},
  onOpenFollowUp = () => {}
}) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = [...tasks].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    // search
    const q = (searchTerm || "").trim().toLowerCase();
    if (q) {
      list = list.filter(t =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.project || "").toLowerCase().includes(q) ||
        (t.department || "").toLowerCase().includes(q) ||
        (t.notes || "").toLowerCase().includes(q)
      );
    }

    // filter tabs
    if (filter === "today") {
      list = list.filter(t => isToday(t.createdAt) || (t.followUpDate && isToday(t.followUpDate)));
    } else if (filter === "pending") {
      list = list.filter(t => (t.status || "Pending") === "Pending");
    } else if (filter === "completed") {
      list = list.filter(t => (t.status || "Pending") === "Completed");
    }

    return list;
  }, [tasks, searchTerm, filter]);

  return (
    <div className="task-list-root">
      <div className="tabs-row">
        <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`tab ${filter === "today" ? "active" : ""}`} onClick={() => setFilter("today")}>Today</button>
        <button className={`tab ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pending</button>
        <button className={`tab ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Completed</button>
      </div>

      <div className="task-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            No tasks found. Tap + to add a task.
          </div>
        ) : (
          filtered.map(task => {
            // compute next follow-up (prefer followUpDate then last followUp)
            let nextIso = task.followUpDate || null;
            // If there are followUps, pick the earliest upcoming or the last created if none upcoming:
            if (task.followUps && task.followUps.length) {
              const upcoming = task.followUps
                .filter(f => f.date)
                .map(f => ({iso: f.date, t: new Date(f.date).getTime()}))
                .filter(x => x.t >= Date.now())
                .sort((a,b) => a.t - b.t);
              if (upcoming.length) {
                nextIso = upcoming[0].iso;
              } else {
                // fallback: last follow-up by createdAt
                const last = [...task.followUps].sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
                if (last) nextIso = last.date || last.createdAt;
              }
            }

            return (
              <div className="task-card" key={task.id}>
                <div className="task-left">
                  <div className="task-title">{task.name}</div>
                  <div className="task-meta">
                    <div className="meta-row">
                      <span className="meta-label">Created:</span>
                      <span className="meta-value created">{fmt(task.createdAt)}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-label meta-next">Next:</span>
                      <span className="meta-value next">{fmt(nextIso)}</span>
                    </div>
                  </div>
                </div>

                <div className="task-right">
                  <div className={`status-badge ${((task.status||"Pending").toLowerCase()) === "completed" ? "completed" : "pending"}`}>
                    {(task.status || "Pending")}
                  </div>

                  <div className="task-actions">
                    <button className="icon-btn plus" title="Add follow-up" onClick={() => onOpenFollowUp(task.id)}>+</button>
                    <button className="icon-btn view" onClick={() => onOpenDetail(task.id)}>View</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
