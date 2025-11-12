import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";
import AddTaskModal from "./components/AddTaskModal";
import AddFollowUpModal from "./components/AddFollowUpModal";
import SettingsModal from "./components/SettingsModal";
import MenuModal from "./components/MenuModal";
import "./styles.css";

const APP_VERSION = "1.0.0";
const STORAGE_KEY = "knk_tasks_v4";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState(() => ["Greenland", "Sriniketan"]);
  const [departments, setDepartments] = useState(() => ["Marketing", "Sales", "Admin", "Legal", "Accounts", "Liaisoning"]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpTargetTaskId, setFollowUpTargetTaskId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // file input ref for import
  const importRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ---- CRUD handlers ----
  const handleAddTask = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString(),
      followUps: [],
    };
    setTasks(prev => [task, ...prev]);
    setShowAddTask(false);
  };

  const handleSaveFollowUp = (payload) => {
    const fu = { ...payload, createdAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === fu.taskId ? { ...t, followUps: [...(t.followUps||[]), fu] } : t));
    setShowAddFollowUp(false);
    setFollowUpTargetTaskId(null);
  };

  const openFollowUpModalFor = (taskId) => {
    setFollowUpTargetTaskId(taskId);
    setShowAddFollowUp(true);
  };

  // delete task + follow-up
  const deleteTask = (taskId) => {
    if (!window.confirm("Delete this task and all its follow-ups?")) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const deleteFollowUp = (taskId, followUpCreatedAtOrIndex) => {
    if (!window.confirm("Delete this follow-up?")) return;
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newFus = t.followUps.filter((fu, idx) => {
          if (fu.createdAt && typeof followUpCreatedAtOrIndex === "string") {
            return fu.createdAt !== followUpCreatedAtOrIndex;
          }
          return idx !== followUpCreatedAtOrIndex;
        });
        return { ...t, followUps: newFus };
      })
    );
  };

  // toggle task status
  const toggleTaskStatus = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" } : t));
  };

  // delete project/department
  const deleteProject = (projectName) => {
    if (!window.confirm(`Delete project "${projectName}"? This will remove the project from existing tasks.`)) return;
    setProjects(prev => prev.filter(p => p !== projectName));
    setTasks(prev => prev.map(t => (t.project === projectName ? { ...t, project: null } : t)));
  };

  const deleteDepartment = (deptName) => {
    if (!window.confirm(`Delete department "${deptName}"? This will remove the department from existing tasks.`)) return;
    setDepartments(prev => prev.filter(d => d !== deptName));
    setTasks(prev => prev.map(t => (t.department === deptName ? { ...t, department: null } : t)));
  };

  // ---- export / import ----
  const exportData = () => {
    const payload = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      projects,
      departments,
      tasks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = `knk-backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!window.confirm("Importing will replace current tasks, projects and departments. Continue?")) return;
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setDepartments(Array.isArray(data.departments) ? data.departments : []);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        alert("Import successful");
      } catch (err) {
        console.error(err);
        alert("Failed to import file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => {
    if (importRef.current) importRef.current.click();
  };

  const handleFileChosen = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) onImportFile(f);
    e.target.value = "";
  };

  // navigation helper: set filter then navigate to /tasks
  const navigateWithFilter = (filter) => {
    localStorage.setItem("knk_filter", filter);
    window.history.pushState({}, "", "/tasks");
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <>
              <Dashboard
                tasks={tasks}
                onCardClick={(filterType) => navigateWithFilter(filterType)}
              />
            </>
          } />

          <Route path="/tasks" element={
            <>
              <TaskList
                tasks={tasks}
                onOpenFollowUpModal={openFollowUpModalFor}
                onDeleteTask={deleteTask}
                onDeleteFollowUp={deleteFollowUp}
                onToggleTaskStatus={toggleTaskStatus}
              />
            </>
          } />
        </Routes>

        {/* Modals */}
        {showAddTask && (
          <AddTaskModal
            isOpen={showAddTask}
            onClose={() => setShowAddTask(false)}
            onSave={handleAddTask}
            projects={projects}
            departments={departments}
            setProjects={setProjects}
            setDepartments={setDepartments}
          />
        )}

        {showAddFollowUp && (
          <AddFollowUpModal
            isOpen={showAddFollowUp}
            onClose={() => { setShowAddFollowUp(false); setFollowUpTargetTaskId(null); }}
            onSave={handleSaveFollowUp}
            tasks={tasks}
            presetTaskId={followUpTargetTaskId}
          />
        )}

        {showSettings && (
          <SettingsModal
            projects={projects}
            departments={departments}
            setProjects={setProjects}
            setDepartments={setDepartments}
            onClose={() => setShowSettings(false)}
            onDeleteProject={deleteProject}
            onDeleteDepartment={deleteDepartment}
          />
        )}

        {/* top-right three-dot menu */}
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 1200, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="dot-menu" title="Menu" onClick={() => setMenuOpen(true)}>⋯</button>
          <div style={{ padding: '6px 10px', background: '#fff', borderRadius: 10, border: '1px solid #eee', display: 'flex', alignItems: 'center', fontSize: 13 }}>
            v{APP_VERSION}
          </div>
        </div>

        <MenuModal
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onExport={exportData}
          onImportClick={triggerImport}
          onOpenSettings={() => setShowSettings(true)}
          version={APP_VERSION}
        />

        <input ref={importRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFileChosen} />

        {/* Floating + button */}
        <button className="fab" onClick={() => setShowAddTask(true)}>+</button>
      </div>
    </Router>
  );
}
