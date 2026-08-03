"use client";

import { useMemo, useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/customers/search-bar";
import { TaskItem } from "@/components/tasks/task-item";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TASK_STATUSES, TASK_STATUS_LABELS } from "@/types/task";

const TABS: { key: TaskStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...TASK_STATUSES.map((s) => ({ key: s, label: TASK_STATUS_LABELS[s] })),
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: tasks = [], isLoading } = useTasks({
    status: activeTab === "all" ? undefined : [activeTab],
    search: debouncedSearch,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: tasks.length };
    for (const t of tasks) map[t.status] = (map[t.status] ?? 0) + 1;
    return map;
  }, [tasks]);

  function openAdd() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function openDelete(task: Task) {
    setDeletingTask(task);
    setDeleteOpen(true);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Tasks</h2>
          <p className="text-sm text-muted">Follow-ups and reminders for your customers.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {tab.label}
                {counts[tab.key] !== undefined && counts[tab.key] > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">{counts[tab.key]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {isLoading && <p className="px-4 py-12 text-center text-sm text-muted">Loading tasks…</p>}

          {!isLoading && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent mb-3">
                <ListChecks className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">No tasks here</p>
              <p className="text-xs text-muted mt-1">
                {debouncedSearch
                  ? "No tasks match your search."
                  : "Add a task to start tracking follow-ups."}
              </p>
            </div>
          )}

          {!isLoading &&
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={openEdit} onDelete={openDelete} />
            ))}
        </div>
      </div>

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editingTask} />
      <DeleteTaskDialog open={deleteOpen} onOpenChange={setDeleteOpen} task={deletingTask} />
    </div>
  );
}
