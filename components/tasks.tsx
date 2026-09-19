"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import DatePicker from "./date-picker";

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
  "Cloud Engineer",
  "Freelancing",
  "Content Creator",
  "Personal Brand",
];

export default function NotionTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
        console.log(data);
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

    const grouped = categoryOrder.reduce((acc: any, category) => {
      acc[category] = sortedTasks.filter((task) => task.category === category);
      return acc;
    }, {});

    // console.log(grouped);

    categoryOrder.forEach(async (category) => {
      if (grouped[category].length > 0) {
        console.log(`\n===== ${category} =====`);
        const byCat = grouped[category].map((task: any, index: any) => {
          const start = new Date(selectedDate);
          const end = new Date(start);

          // start.setHours(6 + index, 0, 0, 0);
          if (category === categoryOrder[0]) {
            start.setHours(6 + index, 0, 0, 0);
            end.setTime(start.getTime() + 60 * 60 * 1000);
          } else if (category === categoryOrder[1]) {
            start.setHours(13 + index, 0, 0, 0);
            end.setTime(start.getTime() + 60 * 60 * 1000);
          } else if (category === categoryOrder[2]) {
            start.setHours(18 + index, 0, 0, 0);
            end.setTime(start.getTime() + 60 * 60 * 1000);
          } else {
            start.setHours(22 + index, 0, 0, 0);
            end.setTime(start.getTime() + 60 * 60 * 1000);
          }
          return {
            title: task.title,
            description: task.category || "",
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            colorId: getCategoryColor(task.categoryColor || "Other"),
          };
        });
        console.log(byCat);
        try {
          const res = await fetch("/api/calendar/tasks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(byCat),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to add events");
          }

          setMessage(
            `✅ Successfully added ${byCat.length} events to Google Calendar!`,
          );
        } catch (error: any) {
          setMessage(`❌ ${error.message}`);
        } finally {
          setAdding(false);
        }
      }
    });
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
