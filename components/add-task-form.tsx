"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AddTaskForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget; // ← Save the form reference first

    setLoading(true);
    setMessage("");

    const formData = new FormData(form);

    const start = formData.get("startTime") as string;
    const end = formData.get("endTime") as string;

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      location: formData.get("location"),
    };

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessage("✅ Task successfully added to Google Calendar!");
      form.reset(); // ← Use the saved reference
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Add Task to Calendar</CardTitle>
        <CardDescription>
          Create a new event in your Google Calendar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Team meeting / Finish report"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
            />
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input id="endTime" name="endTime" type="datetime-local" required />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Office / Zoom / Home"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding Task..." : "Add to Google Calendar"}
          </Button>

          {message && <p className="text-sm text-center mt-2">{message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
