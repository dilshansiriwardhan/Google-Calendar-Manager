"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const calendarColors = [
  "3", // Purple
  "7", // Blue
  "10", // Green
  "5", // Yellow
  "4", // Pink
  "6", // Orange
  "9", // Blue-gray
  "2", // Sage
];

const categoryColorMap: Record<string, string> = {};

function getCategoryColor(category: string) {
  if (!categoryColorMap[category]) {
    const index = Object.keys(categoryColorMap).length;
    categoryColorMap[category] = calendarColors[index % calendarColors.length];
  }

  return categoryColorMap[category];
}

const categoryOrder = [
  "Personal Development",
  "Cloud Engineer",
  "Graphic Designer",
  "Content Creator",
  "Developer",
];

export default function NotionTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const sortedTasks = [...tasks].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.category);
    const indexB = categoryOrder.indexOf(b.category);

    return (
      (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB)
    );
  });

  useEffect(() => {
    fetch("/api/notion/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      });
  }, []);

  const addTasksToCalendar = async () => {
    if (tasks.length === 0) {
      setMessage("No tasks to add");
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      const payload = sortedTasks.map((task, index) => {
        // Use Notion date if available, otherwise use current time
        const start = task.date ? new Date(task.date) : new Date();
        start.setHours(6 + index, 0, 0, 0);

        // Default duration = 1 hour
        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        return {
          title: task.title,
          description: task.category || "",
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          colorId: getCategoryColor(task.categoryColor || "Other"),
        };
      });

      const res = await fetch("/api/calendar/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add events");
      }

      setMessage(
        `✅ Successfully added ${payload.length} events to Google Calendar!`,
      );
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p>Loading Notion tasks...</p>;

  return (
    <div className="my-3 grid grid-cols-2 gap-6">
      {/* Left - Notion Tasks List */}
      <div>
        <h2 className="text-xl font-semibold my-2">Notion Tasks</h2>

        {tasks.length === 0 && <p>No tasks found.</p>}

        {tasks.map((task) => (
          <div key={task.id} className="border p-4 rounded-lg mb-2">
            <h3 className="font-medium">{task.title}</h3>
            <div className="flex justify-between mt-1">
              <p className="text-sm text-muted-foreground">
                {task.category || "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {task.date || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right - Action Button */}
      <div className="flex flex-col gap-4">
        <Button
          onClick={addTasksToCalendar}
          disabled={adding || tasks.length === 0}
        >
          {adding ? "Adding to Calendar..." : "Add to Google Calendar"}
        </Button>

        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
