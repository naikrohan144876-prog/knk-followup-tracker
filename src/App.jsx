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

  const importRef = useRef(null);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ---------- CRUD Handlers ----------
  const handleAddTask = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString(),
      status: newTask.status || "Pending",
      followUps: [],
    };
    setTasks((prev) => [task, ...prev]);
    setShowAddTask(false);
  };

  const handleSaveFollowUp = (payload) => {
    const followUp = { ...payload, createdAt: new Date().toISOString() };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === followUp.taskId
          ? { ...t, followUps: [...(t.followUps || []), followUp] }
          : t
      )
    );
    setShowAddFollowUp(false);
    setFollowUpTargetTaskId(null);
  };

  const openFollowUpModalFor = (taskId) => {
    setFollowUpTargetTaskId(taskId);
    setShowAddFollowUp(true);
  };

  const deleteTask = (taskId) => {
    if (!window.confirm("Delete this task and all follow-ups?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const deleteFollowUp = (taskId, followUpCreatedAtOrIndex) => {
    if (!window.confirm("Delete this follow-up?")) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedFollowUps = t.followUps.filter(
          (fu) => fu.createdAt !== followUpCreatedAtOrIndex
        );
        return { ...t, followUps: updatedFollowUps };
      })
    );
  };

  const toggleTaskStatus = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" }
          : t
      )
    );
  };

  const deleteProject = (projectName) => {
    if (!window.confirm(`Delete project "${projectName}"?`)) return;
    setProjects((prev) => prev.filter((p) => p !== projectName));
    setTasks((prev) =>
      prev.map((t) =>
        t.project === projectName ? { ...t, project: null } : t
      )
    );
  };

  const deleteDepartment = (deptName) => {
    if (!window.confirm(`Delete department "${deptName}"?`)) return;
    setDepartments((prev) => prev.filter((d) => d !== deptName));
    setTasks((prev) =>
      prev.map((t) =>
        t.department === deptName ? { ...t, department: null } : t
      )
    );
  };

  // ---------- Export / Import ----------
  const exportData = () => {
    const data = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      projects,
      departments,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knk-backup-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!window.confirm("Replace all current data with imported file?"))
          return;
        setProjects(data.projects || []);
        setDepartments(data.departments || []);
        setTasks(data.tasks || []);
        alert("Import successful!");
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const triggerImport = () => importRef.current?.click();
  const handleFileChosen = (e) => {
    const file = e.target.files[0];
    if (file) onImportFile(file);
    e.target.value = "";
  };

  // Navigation helper for filtering Dashboard
  const navigateWithFilter = (filterType) => {
    localStorage.setItem("knk_filter", filterType);
    window.history.pushState({}, "", "/tasks");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // ---------- Layout ----------
  const [route, setRoute] = useState(window.location.pathname);
  useEffect(() => {
    const updateRoute = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  const active = route.includes("tasks") ? "tasks" : "dashboard";

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <>
                <Dashboard
                  tasks={tasks}
                  onCardClick={navigateWithFilter}
                />
                <BottomNav active="dashboard" />
              </>
            }
          />
          <Route
            path="/tasks"
            element={
              <>
                <TaskList
                  tasks={tasks}
                  onOpenFollowUpModal={openFollowUpModalFor}
                  onDeleteTask={deleteTask}
                  onDeleteFollowUp={deleteFollowUp}
                  onToggleTaskStatus={toggleTaskStatus}
                />
                <BottomNav active="tasks" />
              </>
            }
          />
        </Routes>

        {/* Add / Follow-up Modals */}
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
            onClose={() => {
              setShowAddFollowUp(false);
              setFollowUpTargetTaskId(null);
            }}
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

        {/* Top-left 3-dot Menu */}
        <div
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1200,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <button
            className="dot-menu"
            title="Menu"
            onClick={() => setMenuOpen(true)}
          >
            ⋯
          </button>
          <div
            style={{
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #eee",
              fontSize: 13,
            }}
          >
            v{APP_VERSION}
          </div>
        </div>

        {/* Menu Modal */}
        <MenuModal
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onExport={exportData}
          onImportClick={triggerImport}
          onOpenSettings={() => setShowSettings(true)}
          version={APP_VERSION}
        />

        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleFileChosen}
        />

        {/* Floating + button */}
        <button className="fab" onClick={() => setShowAddTask(true)}>
          +
        </button>
      </div>
    </Router>
  );
}

// ---------- Bottom Navigation ----------
function BottomNav({ active }) {
  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return (
    <div className="bottom-nav">
      <button
        className={active === "dashboard" ? "active" : ""}
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>
      <button
        className={active === "tasks" ? "active" : ""}
        onClick={() => navigate("/tasks")}
      >
        Tasks
      </button>
    </div>
  );
}
