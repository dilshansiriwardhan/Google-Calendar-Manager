"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import DatePicker from "./date-picker";

const calendarColors = ["3", "7", "10", "5", "4", "6", "9", "2"] as const;

const categoryOrder = [
  "Cloud Engineer",
  "Freelancing",
  "Content Creator",
  "Personal Brand",
] as const;

type Category = (typeof categoryOrder)[number];

interface NotionTask {
  id: string;
  title: string;
  category?: string;
  date?: string;
  // add other fields you actually use
}

interface CalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  colorId: string;
}

// Simple stable color assignment (module-level is fine for this use case)
const categoryColorMap = new Map<string, string>();

function getCategoryColor(category: string): string {
  if (!categoryColorMap.has(category)) {
    const index = categoryColorMap.size;
    categoryColorMap.set(
      category,
      calendarColors[index % calendarColors.length]
    );
  }
  return categoryColorMap.get(category)!;
}

/** Returns start hour for a category (based on order) */
function getStartHour(category: string): number {
  const index = categoryOrder.indexOf(category as Category);
  switch (index) {
    case 0: return 6;   // Cloud Engineer
    case 1: return 13;  // Freelancing
    case 2: return 18;  // Content Creator
    default: return 22; // Personal Brand + unknowns
  }
}

export default function NotionTasks() {
  const [tasks, setTasks] = useState<NotionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Stable sorted list
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.category as Category);
      const indexB = categoryOrder.indexOf(b.category as Category);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });
  }, [tasks]);

  // Group once
  const groupedTasks = useMemo(() => {
    return categoryOrder.reduce<Record<string, NotionTask[]>>((acc, cat) => {
      acc[cat] = sortedTasks.filter((t) => t.category === cat);
      return acc;
    }, {});
  }, [sortedTasks]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/notion/tasks");
        if (!res.ok) throw new Error("Failed to load tasks");
        const data = await res.json();
        if (!cancelled) {
          setTasks(data.tasks ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : "Failed to load tasks");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const addTasksToCalendar = useCallback(async () => {
    if (tasks.length === 0) {
      setMessage("No tasks to add");
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      const promises = categoryOrder.map(async (category) => {
        const tasksInCategory = groupedTasks[category] ?? [];
        if (tasksInCategory.length === 0) return null;

        const events: CalendarEvent[] = tasksInCategory.map((task, index) => {
          // Always create NEW Date objects
          const start = new Date(selectedDate);
          start.setHours(getStartHour(category) + index, 0, 0, 0);

          const end = new Date(start);
          end.setTime(start.getTime() + 60 * 60 * 1000); // 1 hour

          return {
            title: task.title,
            description: task.category ?? "",
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            colorId: getCategoryColor(task.category ?? "Other"),
          };
        });

        const res = await fetch("/api/calendar/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(events),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to add ${category} events`);
        }

        return events.length;
      });

      const results = await Promise.all(promises);
      const totalAdded = results.reduce((sum: number, n) => sum + (n ?? 0), 0);

      setMessage(`✅ Successfully added ${totalAdded} events to Google Calendar!`);
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setAdding(false);
    }
  }, [tasks.length, groupedTasks, selectedDate]);

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
        <DatePicker date={selectedDate} setDate={setSelectedDate} />
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