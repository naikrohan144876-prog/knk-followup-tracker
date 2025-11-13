// src/components/TaskDetail.jsx
import React, { useMemo, useState, useEffect } from "react";

/* date format helper dd/mm/yyyy, h:mm AM/PM */
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

/* returns next upcoming follow-up ISO or null */
const nextUpcoming = (task) => {
  if (!task) return null;
  const now = Date.now();
  const arr = (task.followUps || [])
    .filter(fu => fu.date)
    .map(fu => ({ iso: fu.date, time: new Date(fu.date).getTime() }));
  if (task.followUpDate) arr.push({ iso: task.followUpDate, time: new Date(task.followUpDate).getTime() });
  const future = arr.filter(a => a.time >= now);
  if (!future.length) return null;
  future.sort((a,b) => a.time - b.time);
  return future[0].iso;
};

export default function TaskDetail({
  task,
  onClose = () => {},
  onDelete = () => {},
  onDeleteFollowUp = () => {},
  onUpdateStatus = () => {}
}) {
  const [status, setStatus] = useState(task?.status || "Pending");

  useEffect(() => {
    setStatus(task?.status || "Pending");
  }, [task]);

  const upcoming = useMemo(() => nextUpcoming(task), [task]);

  if (!task) return null;

  const handleStatusChange = (v) => {
    setStatus(v);
    onUpdateStatus(task.id, v);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container taskdetail-modal" role="document">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="taskdetail-head">
          <h2 className="task-title">{task.name}</h2>
        </div>

        <div className="taskdetail-meta">
          <div className="meta-block">
            <div className="meta-label">Created</div>
            <div className="meta-value created">{fmt(task.createdAt)}</div>
          </div>

          <div className="meta-block">
            <div className="meta-label">Next</div>
            <div className="meta-value next">{fmt(upcoming || task.followUpDate)}</div>
          </div>
        </div>

        <div className="taskdetail-section">
          <label className="field-label">Status</label>
          <select className="form-select" value={status} onChange={(e) => handleStatusChange(e.target.value)}>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="taskdetail-section">
          <label className="field-label">Notes</label>
          <div className="note-box">{task.notes || "No notes"}</div>
        </div>

        <div className="taskdetail-section">
          <h3 className="followups-heading">Follow-ups</h3>
          {(task.followUps || []).length === 0 ? (
            <div className="no-followups">No follow-ups</div>
          ) : (
            <div className="followups-list">
              {[...task.followUps].sort((a,b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)).map((fu) => (
                <div key={fu.createdAt || fu.date} className="followup-row">
                  <div className="follow-left">
                    <div className="follow-title">{fu.title || "Follow-up"}</div>
                    <div className="follow-notes">{fu.notes || ""}</div>
                  </div>
                  <div className="follow-right">
                    <div className="follow-date">{fmt(fu.date || fu.createdAt)}</div>
                    <div className="follow-status">{fu.status || "Pending"}</div>
                    <div style={{marginTop:8}}>
                      <button className="btn-small" onClick={() => onDeleteFollowUp(task.id, fu.createdAt)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button
            className="btn-delete"
            onClick={() => { if (window.confirm("Delete this task?")) { onDelete(task.id); onClose(); } }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}
