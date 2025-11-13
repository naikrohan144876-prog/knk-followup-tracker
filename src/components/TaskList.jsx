// src/components/TaskList.jsx
import React, { useMemo, useState } from "react";

/* date formatter dd/mm/yyyy, hh:mm AM/PM */
const fmt = (iso) => {
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

/* find earliest upcoming follow-up or null */
const getNextUpcoming = (task) => {
  const now = Date.now();
  const arr = (task.followUps || []).filter(fu => fu.date).map(fu => ({ iso: fu.date, t: new Date(fu.date).getTime() }));
  if (task.followUpDate) arr.push({ iso: task.followUpDate, t: new Date(task.followUpDate).getTime() });
  const upcoming = arr.filter(a => a.t >= now);
  if (upcoming.length) {
    upcoming.sort((a,b) => a.t - b.t);
    return upcoming[0].iso;
  }
  return null;
};

export default function TaskList({ tasks = [], searchTerm = "", onOpenDetail = () => {}, onOpenFollowUp = () => {} }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    let list = (tasks || []).slice();
    if (q) {
      list = list.filter(t => {
        if ((t.name || "").toLowerCase().includes(q)) return true;
        if ((t.project || "").toLowerCase().includes(q)) return true;
        if ((t.department || "").toLowerCase().includes(q)) return true;
        if ((t.notes || "").toLowerCase().includes(q)) return true;
        // follow-up notes or title
        if ((t.followUps || []).some(fu => ((fu.notes||"") + " " + (fu.title||"")).toLowerCase().includes(q))) return true;
        return false;
      });
    }

    // simple filter shortcuts
    if (filter === "pending") list = list.filter(t => (t.status || "Pending") === "Pending" || (t.followUps || []).some(fu => (fu.status||"Pending")==="Pending"));
    if (filter === "completed") list = list.filter(t => (t.status || "Pending") === "Completed");
    if (filter === "today") {
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate()+1);
      list = list.filter(t => new Date(t.createdAt) >= todayStart && new Date(t.createdAt) < todayEnd);
    }
    // sort newest created first
    list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [tasks, searchTerm, filter]);

  return (
    <div className="task-list-wrapper">
      <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:12, flexWrap:'wrap'}}>
        <button className={`filter-btn ${filter==='all' ? 'active' : ''}`} onClick={()=>setFilter('all')}>All</button>
        <button className={`filter-btn ${filter==='today' ? 'active' : ''}`} onClick={()=>setFilter('today')}>Today</button>
        <button className={`filter-btn ${filter==='pending' ? 'active' : ''}`} onClick={()=>setFilter('pending')}>Pending</button>
        <button className={`filter-btn ${filter==='completed' ? 'active' : ''}`} onClick={()=>setFilter('completed')}>Completed</button>
      </div>

      {filtered.length === 0 ? <div className="no-tasks">No tasks yet. Tap + to add.</div> :
        filtered.map(task => {
          const next = getNextUpcoming(task);
          return (
            <div className="task-item" key={task.id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
                    <div style={{fontWeight:800, fontSize:16, overflow:'visible'}}>{task.name}</div>
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <div className={`status-badge ${((task.status||'Pending').toLowerCase()==='completed') ? 'completed' : 'pending'}`}>{task.status || 'Pending'}</div>
                    </div>
                  </div>

                  <div className="task-dates" style={{marginTop:8}}>
                    <span className="time-created small">Created: {fmt(task.createdAt)}</span>
                    { next ? <span style={{marginLeft:12}} className="time-followup small">Next: {fmt(next)}</span> : (task.followUpDate ? <span style={{marginLeft:12}} className="time-followup small">Next: {fmt(task.followUpDate)}</span> : null)}
                  </div>
                </div>

                <div style={{display:'flex', gap:8, marginLeft:12}}>
                  <button className="btn-small" onClick={()=>onOpenFollowUp(task.id)}>+</button>
                  <button className="btn-small" onClick={()=>onOpenDetail(task.id)}>View</button>
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}
