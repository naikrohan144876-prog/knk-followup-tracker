// src/components/TaskDetail.jsx
import React, { useMemo, useState } from "react";

/* date fmt dd/mm/yyyy hh:mm AM/PM */
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

export default function TaskDetail({ task, onClose = () => {}, onDelete = () => {}, onDeleteFollowUp = () => {}, onUpdateStatus = () => {} }) {
  const [status, setStatus] = useState(task?.status || 'Pending');

  const nextUpcoming = useMemo(() => {
    if (!task) return null;
    const now = Date.now();
    const arr = (task.followUps || []).filter(fu => fu.date).map(fu => ({ iso: fu.date, t: new Date(fu.date).getTime() }));
    if (task.followUpDate) arr.push({ iso: task.followUpDate, t: new Date(task.followUpDate).getTime() });
    const upcoming = arr.filter(a => a.t >= now);
    if (upcoming.length) {
      upcoming.sort((a,b) => a.t - b.t);
      return upcoming[0].iso;
    }
    return null;
  }, [task]);

  const handleStatusChange = (v) => {
    setStatus(v);
    onUpdateStatus(task.id, v);
  };

  if (!task) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 style={{marginTop:0, marginBottom:6, fontSize:18}}>{task.name}</h2>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
          <div style={{fontSize:13}}><strong>Created:</strong> <span className="time-created">{fmt(task.createdAt)}</span></div>
          <div style={{fontSize:13}}><strong>Next:</strong> <span className="time-followup">{ nextUpcoming ? fmt(nextUpcoming) : (task.followUpDate ? fmt(task.followUpDate) : '-') }</span></div>
        </div>

        <div style={{marginTop:12}}>
          <label style={{fontWeight:700, fontSize:13}}>Status</label>
          <select value={status} onChange={(e)=>handleStatusChange(e.target.value)} style={{width:'100%', padding:10, borderRadius:8, marginTop:8}}>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>

        <div style={{marginTop:12}}>
          <label style={{fontWeight:700, fontSize:13}}>Notes</label>
          <div className="readonly-field" style={{marginTop:8}}>{task.notes || 'No notes'}</div>
        </div>

        <div style={{marginTop:12}}>
          <strong>Follow-ups</strong>
          {(!task.followUps || task.followUps.length===0) ? <div style={{color:'#6b7280', marginTop:8}}>No follow-ups</div> : (
            <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:8}}>
              {[...task.followUps].sort((a,b)=>new Date(b.date||b.createdAt||0)-new Date(a.date||a.createdAt||0)).map((fu, idx)=>(
                <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, background:'#fbfcff', padding:8, borderRadius:8}}>
                  <div style={{maxWidth:'70%'}}>
                    <div style={{fontWeight:700}}>{fu.title || 'Follow-Up'}</div>
                    <div style={{color:'#374151', fontSize:13}}>{fu.notes || ''}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="time-followup">{fu.date ? fmt(fu.date) : (fu.createdAt ? fmt(fu.createdAt) : '')}</div>
                    <div style={{fontSize:12, color:'#6b7280'}}>{fu.status || 'Pending'}</div>
                    <div style={{marginTop:6}}>
                      <button className="btn-small" onClick={()=>onDeleteFollowUp(task.id, fu.createdAt)} style={{background:'#fff', border:'1px solid #ef4444', color:'#ef4444'}}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{display:'flex', gap:10, marginTop:16}}>
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button className="btn-delete" onClick={()=>{ onDelete(task.id); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
