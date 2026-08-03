import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi, ApiError } from "@/lib/api-client";
import { TaskInput } from "@/types/task";
import { useNotifications } from "@/hooks/use-notifications";

function invalidateTasks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: (input: TaskInput) => tasksApi.createTask(input),
    onSuccess: (task) => {
      invalidateTasks(queryClient);
      toast.success("Task created");
      notify({ title: "Task created", description: task.title, type: "success" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) =>
      tasksApi.updateTask(id, input),
    onSuccess: (task) => {
      invalidateTasks(queryClient);
      toast.success("Task updated");
      notify({ title: "Task updated", description: task.title, type: "info" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update task");
    },
  });
}

/** Silent variant used for the checkbox toggle — no toast on success. */
export function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskInput["status"] }) =>
      tasksApi.updateTask(id, { status }),
    onSuccess: () => invalidateTasks(queryClient),
    onError: (err) => {
      invalidateTasks(queryClient);
      toast.error(err instanceof ApiError ? err.message : "Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const notify = useNotifications((s) => s.add);
  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: (task) => {
      invalidateTasks(queryClient);
      toast.success("Task deleted");
      notify({ title: "Task deleted", description: task.title, type: "error" });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete task");
    },
  });
}
