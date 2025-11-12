// src/components/TaskList.jsx
import React, { useState, useMemo, useEffect } from "react";

/* date formatter: DD/MM/YYYY, hh:mm AM/PM */
const fmt = (iso) => {
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

const isInRange = (iso, start, end) => {
  if (!iso) return false;
  const d = new Date(iso);
  return d >= start && d < end;
};

/*
Props expected:
 - tasks: array
 - onOpenFollowUpModal(taskId)
 - onDeleteTask(taskId)
 - onDeleteFollowUp(taskId, identifier)
 - onToggleTaskStatus(taskId)   <-- NEW: toggles Pending/Completed for a task
*/
const TaskList = ({ tasks = [], onOpenFollowUpModal, onDeleteTask, onDeleteFollowUp, onToggleTaskStatus }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const f = localStorage.getItem("knk_filter");
    if (f) {
      setFilter(f);
      localStorage.removeItem("knk_filter");
    }
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfWeek = new Date(startOfToday); endOfWeek.setDate(endOfWeek.getDate() + 7);

  /* Returns ISO of most recent followup (used earlier) - kept for expanded view sorting */
  const getMostRecentFollowUp = (task) => {
    const fus = task.followUps || [];
    if (!fus.length) return null;
    let latest = null;
    for (const fu of fus) {
      const cand = fu.date || fu.createdAt || null;
      if (!cand) continue;
      const t = new Date(cand).getTime();
      if (!latest || t > latest) latest = t;
    }
    return latest ? new Date(latest).toISOString() : null;
  };

  /* NEW: compute the next upcoming follow-up date (earliest date >= now).
     If none, fallback to task.followUpDate (could be in future or past). */
  const getNextFollowUp = (task) => {
    const fus = (task.followUps || []).filter(fu => fu.date).map(fu => ({ date: new Date(fu.date).getTime(), iso: fu.date }));
    // also include task.followUpDate if provided
    if (task.followUpDate) {
      fus.push({ date: new Date(task.followUpDate).getTime(), iso: task.followUpDate });
    }
    if (!fus.length) return null;
    // filter upcoming (>= now)
    const nowTime = Date.now();
    const upcoming = fus.filter(x => x.date >= nowTime);
    if (upcoming.length) {
      // earliest upcoming
      upcoming.sort((a,b) => a.date - b.date);
      return new Date(upcoming[0].iso).toISOString();
    }
    // if no future ones, return the soonest in the past (optional) — here we prefer null
    return null;
  };

  const filteredSortedTasks = useMemo(() => {
    // attach convenience fields
    const enriched = tasks.map(t => {
      return {
        ...t,
        _mostRecentFollowUp: getMostRecentFollowUp(t),
        _nextFollowUpDate: getNextFollowUp(t),
      };
    });

    // sort by createdAt desc (newest created first)
    const sorted = enriched.sort((a,b) => {
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
      return bCreated - aCreated;
    });

    if (filter === "all") return sorted;

    if (filter === "today") {
      return sorted.filter(t => {
        const createdToday = t.createdAt && isInRange(t.createdAt, startOfToday, endOfToday);
        const followToday = (t.followUps || []).some(fu => fu.date && isInRange(fu.date, startOfToday, endOfToday));
        const taskNext = t._nextFollowUpDate && isInRange(t._nextFollowUpDate, startOfToday, endOfToday);
        return createdToday || followToday || taskNext;
      });
    }

    if (filter === "week") {
      return sorted.filter(t => {
        const createdWeek = t.createdAt && (new Date(t.createdAt) >= startOfToday && new Date(t.createdAt) <= endOfWeek);
        const followWeek = (t.followUps || []).some(fu => fu.date && (new Date(fu.date) >= startOfToday && new Date(fu.date) <= endOfWeek));
        const taskNext = t._nextFollowUpDate && (new Date(t._nextFollowUpDate) >= startOfToday && new Date(t._nextFollowUpDate) <= endOfWeek);
        return createdWeek || followWeek || taskNext;
      });
    }

    if (filter === "followups") {
      return sorted.filter(t => (t.followUps || []).length > 0 || !!t.followUpDate);
    }

    if (filter === "pending") {
      return sorted.filter(t => {
        if ((t.followUps || []).some(fu => (fu.status || "Pending") === "Pending")) return true;
        if ((t.status || "Pending") === "Pending") return true;
        return false;
      });
    }

    if (filter === "completed") {
      return sorted.filter(t => {
        if ((t.followUps || []).some(fu => (fu.status || "Pending") === "Completed")) return true;
        if ((t.status || "Pending") === "Completed") return true;
        return false;
      });
    }

    return sorted;
  }, [tasks, filter, startOfToday, endOfToday, endOfWeek]);

  return (
    <div className="task-list-wrapper">
      <h2 className="task-header">My Tasks</h2>

      <div style={{display:'flex', gap:8, marginBottom:12, justifyContent:'center', flexWrap:'wrap'}}>
        <button className={`btn-small ${filter==='all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`btn-small ${filter==='today' ? 'active' : ''}`} onClick={() => setFilter('today')}>Today</button>
        <button className={`btn-small ${filter==='week' ? 'active' : ''}`} onClick={() => setFilter('week')}>This Week</button>
        <button className={`btn-small ${filter==='followups' ? 'active' : ''}`} onClick={() => setFilter('followups')}>With Follow-ups</button>
        <button className={`btn-small ${filter==='pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`btn-small ${filter==='completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
      </div>

      <div className="task-list">
        {filteredSortedTasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Tap + to add a task.</p>
        ) : filteredSortedTasks.map(task => {
          // sort follow-ups newest first for expanded list
          const sortedFollowUps = (task.followUps || []).slice().sort((a,b) => {
            const aTime = new Date(a.date || a.createdAt || 0).getTime();
            const bTime = new Date(b.date || b.createdAt || 0).getTime();
            return bTime - aTime;
          });

          // next upcoming follow-up (computed earlier)
          const next = task._nextFollowUpDate || null;

          return (
            <div className="task-item" key={task.id}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%"}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:10, justifyContent:'space-between'}}>
                    <div style={{minWidth:0}}>
                      <div className="task-title" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{task.name}</div>
                    </div>

                    {/* Status badge + toggle */}
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <div className={`status-badge ${ (task.status || "Pending").toLowerCase() === 'completed' ? 'completed' : 'pending' }`}>
                        {(task.status || "Pending")}
                      </div>
                      <button
                        className="btn-small"
                        onClick={() => onToggleTaskStatus && onToggleTaskStatus(task.id)}
                        title="Toggle status"
                      >
                        { (task.status || "Pending") === "Completed" ? "Mark Pending" : "Mark Done" }
                      </button>
                    </div>
                  </div>

                  <div className="task-dates" style={{marginTop:6}}>
                    {/* Created date (always task.createdAt) */}
                    <span className="time-created small">Created: {fmt(task.createdAt)}</span>

                    {/* Next follow-up date (earliest upcoming) */}
                    {next ? <span style={{marginLeft:12}} className="time-followup small">Next: {fmt(next)}</span>
                          : (task.followUpDate ? <span style={{marginLeft:12}} className="time-followup small">Next: {fmt(task.followUpDate)}</span> : null)}
                  </div>
                </div>

                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <button className="followup-btn" onClick={() => onOpenFollowUpModal && onOpenFollowUpModal(task.id)}>+</button>
                  <button className="btn-small" onClick={() => setExpandedId(prev => prev===task.id?null:task.id)}>{expandedId===task.id ? "Close" : "View"}</button>
                  <button className="btn-small" onClick={() => onDeleteTask && onDeleteTask(task.id)} style={{background:'#fff', border:'1px solid #ef4444', color:'#ef4444'}}>Delete</button>
                </div>
              </div>

              {expandedId === task.id && (
                <div style={{marginTop:12}}>
                  <div style={{marginBottom:8}}>
                    <strong>Project:</strong> {task.project || "-"} &nbsp; | &nbsp;
                    <strong>Department:</strong> {task.department || "-"}
                  </div>

                  <div style={{marginBottom:8}}>
                    <strong>Notes:</strong>
                    <div style={{padding:8, background:"#fbfdff", borderRadius:8, marginTop:6}}>{task.notes || "No details"}</div>
                  </div>

                  <div style={{marginTop:6}}>
                    <strong>Follow-ups</strong>
                    {sortedFollowUps.length === 0 ? (
                      <div style={{color:"#6b7280", marginTop:6}}>No follow-ups</div>
                    ) : (
                      <div className="followup-list" style={{marginTop:6}}>
                        {sortedFollowUps.map((fu, idx) => (
                          <div key={idx} className="followup-item">
                            <div style={{maxWidth:'70%'}}>
                              <div style={{fontWeight:700}}>{fu.title || "Follow-Up"}</div>
                              <div style={{color:"#374151", fontSize:13, overflow:'hidden', textOverflow:'ellipsis'}}>{fu.notes || ""}</div>
                              {fu.contact && (
                                <div style={{marginTop:6}}>
                                  <div style={{fontSize:13}}><strong>Contact:</strong> {fu.contact.name || ""} {fu.contact.phone ? `(${fu.contact.phone})` : ""}</div>
                                </div>
                              )}
                            </div>

                            <div style={{textAlign:"right"}}>
                              {/* follow-up date (fu.date preferred, else createdAt) */}
                              <div className="time-followup">{fu.date ? fmt(fu.date) : (fu.createdAt ? fmt(fu.createdAt) : "")}</div>
                              <div style={{fontSize:12, color:"#6b7280"}}>{fu.status || "Pending"}</div>
                              <div style={{marginTop:6, display:'flex', gap:6, justifyContent:'flex-end'}}>
                                <button className="btn-small" onClick={() => onDeleteFollowUp && onDeleteFollowUp(task.id, fu.createdAt || idx)} style={{background:'#fff', border:'1px solid #ef4444', color:'#ef4444'}}>Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
