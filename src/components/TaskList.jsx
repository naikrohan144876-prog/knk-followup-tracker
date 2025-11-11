import React, { useState, useMemo } from "react";

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const TaskList = ({ tasks = [], onOpenFollowUpModal }) => {
  const [expandedId, setExpandedId] = useState(null);

  // sort tasks: newest first
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [tasks]);

  return (
    <div className="task-list-wrapper">
      <h2 className="task-header">My Tasks</h2>

      <div className="task-list">
        {sortedTasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Tap + to add a task.</p>
        ) : sortedTasks.map(task => {
          // show latest followup date if any
          const sortedFollowUps = (task.followUps || []).slice().sort((a,b) => (new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)));
          const next = task.followUpDate || (sortedFollowUps[0] && sortedFollowUps[0].date) || null;

          return (
            <div className="task-item" key={task.id}>
              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%"}}>
                <div style={{flex:1}}>
                  <div className="task-title">{task.name}</div>
                  <div className="task-dates">
                    <span style={{color:"#1e88e5"}}>Created: {fmt(task.createdAt)}</span>
                    {next && <span style={{marginLeft:10, color:"#ef4444"}}>Next: {fmt(next)}</span>}
                  </div>
                </div>

                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <button className="followup-btn" onClick={() => onOpenFollowUpModal && onOpenFollowUpModal(task.id)} title="Add follow-up">+</button>
                  <button className="btn-small" onClick={() => setExpandedId(prev => prev===task.id?null:task.id)}>{expandedId===task.id ? "Close" : "View"}</button>
                </div>
              </div>

              {/* Expanded details */}
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
                          <div key={idx} className="followup-item" style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
                            <div>
                              <div style={{fontWeight:700}}>{fu.title || "Follow-Up"}</div>
                              <div style={{color:"#374151", fontSize:13}}>{fu.notes || ""}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{color:"#ef4444", fontWeight:700}}>{fu.date ? fmt(fu.date) : (fu.createdAt ? fmt(fu.createdAt) : "")}</div>
                              <div style={{fontSize:12, color:"#6b7280"}}>{fu.status || "Pending"}</div>
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
