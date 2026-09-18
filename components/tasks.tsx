"use client";

import { useEffect, useState } from "react";

export default function NotionTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notion/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading Notion tasks...</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Notion Tasks</h2>

      {tasks.length === 0 && <p>No tasks found.</p>}

      {tasks.map((task) => (
        <div key={task.id} className="border p-4 rounded-lg">
          <h3 className="font-medium">{task.title}</h3>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {task.category || "—"}
            </p>
            <p className="text-sm text-muted-foreground">{task.date || "—"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
