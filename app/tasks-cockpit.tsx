"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck, MessageSquare, RotateCcw, Send } from "lucide-react";

type Assignee = {
  recipientKey: string;
  displayName: string;
  completedAt: string | null;
};

type Comment = {
  id: string;
  authorKey: string;
  authorName: string;
  commentText: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: "normal" | "hoch";
  assigneesVisible: boolean;
  createdByName: string;
  createdAt: string;
  completedAt: string | null;
  assignees: Assignee[];
  comments: Comment[];
};

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function TasksCockpit() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);

  async function refresh() {
    const response = await fetch("/api/tasks", { cache: "no-store" });
    if (!response.ok) throw new Error("Aufgaben konnten nicht geladen werden");
    setTasks(await response.json());
  }

  useEffect(() => {
    refresh().catch(() => setError("Die Aufgaben sind momentan nicht erreichbar.")).finally(() => setLoading(false));
  }, []);

  const openTasks = useMemo(() => tasks.filter(task => !task.completedAt), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(task => task.completedAt), [tasks]);
  const visible = showDone ? doneTasks : openTasks;

  async function action(taskId: string, actionName: "comment" | "complete" | "reopen") {
    const comment = comments[taskId]?.trim() || "";
    if (actionName === "comment" && !comment) return;
    setWorking(taskId + actionName);
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId, action: actionName, comment }),
      });
      if (!response.ok) throw new Error("Aktion fehlgeschlagen");
      if (actionName === "comment") setComments(current => ({ ...current, [taskId]: "" }));
      await refresh();
    } catch {
      setError("Die Änderung konnte nicht gespeichert werden.");
    } finally {
      setWorking("");
    }
  }

  return <section className="content tasks-content">
    <div className="page-heading">
      <div className="heading-icon"><ClipboardCheck size={25}/></div>
      <div><p className="overline">MEINE AUFGABEN</p><h1>Aufgaben</h1><span>Deine offenen Aufgaben und Rückfragen aus dem DeBruynOS.</span></div>
    </div>

    <div className="tasks-summary">
      <div><span>OFFEN</span><strong>{openTasks.length}</strong></div>
      <button onClick={() => setShowDone(false)} className={!showDone ? "active" : ""}>Offene Aufgaben</button>
      <button onClick={() => setShowDone(true)} className={showDone ? "active" : ""}>Erledigt ({doneTasks.length})</button>
    </div>

    {error && <div className="tasks-error">{error}</div>}
    {loading && <div className="goal-state"><strong>Aufgaben werden geladen …</strong></div>}
    {!loading && visible.length === 0 && <div className="goal-state"><CheckCircle2 size={30}/><strong>{showDone ? "Noch keine erledigten Aufgaben" : "Alles erledigt"}</strong><span>Neue Aufgaben erscheinen automatisch hier.</span></div>}

    <div className="tasks-list">
      {visible.map(task => <article key={task.id} className={`task-card ${task.priority === "hoch" ? "high" : ""} ${task.completedAt ? "done" : ""}`}>
        <div className="task-card-head">
          <div>
            <div className="task-badges">
              {task.priority === "hoch" && <span className="task-priority">HOCH</span>}
              {task.dueDate && <span className={isOverdue(task) ? "overdue" : ""}>Fällig {dateFmt.format(new Date(task.dueDate + "T12:00:00"))}</span>}
            </div>
            <h2>{task.title}</h2>
            {task.description && <p>{task.description}</p>}
          </div>
          <button
            className={task.completedAt ? "task-reopen" : "task-complete"}
            onClick={() => action(task.id, task.completedAt ? "reopen" : "complete")}
            disabled={working.startsWith(task.id)}
          >
            {task.completedAt ? <><RotateCcw size={16}/> Wieder öffnen</> : <><CheckCircle2 size={17}/> Erledigt</>}
          </button>
        </div>

        {task.assigneesVisible && task.assignees.length > 1 && <div className="task-assignees">
          {task.assignees.map(person => <span key={person.recipientKey} className={person.completedAt ? "done" : ""}>
            {person.completedAt ? <CheckCircle2 size={13}/> : <Circle size={13}/>} {person.displayName}
          </span>)}
        </div>}

        {task.comments.length > 0 && <div className="task-comments">
          {task.comments.map(comment => <div key={comment.id}>
            <header><strong>{comment.authorName}</strong><span>{dateTimeFmt.format(new Date(comment.createdAt))}</span></header>
            <p>{comment.commentText}</p>
          </div>)}
        </div>}

        <div className="task-comment-form">
          <MessageSquare size={17}/>
          <input
            value={comments[task.id] || ""}
            onChange={event => setComments(current => ({ ...current, [task.id]: event.target.value }))}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); action(task.id, "comment"); } }}
            placeholder="Kommentar oder Rückfrage …"
          />
          <button onClick={() => action(task.id, "comment")} disabled={!comments[task.id]?.trim() || working.startsWith(task.id)}><Send size={15}/></button>
        </div>
      </article>)}
    </div>
  </section>;
}

function isOverdue(task: Task) {
  return Boolean(task.dueDate && !task.completedAt && new Date(task.dueDate + "T23:59:59") < new Date());
}
