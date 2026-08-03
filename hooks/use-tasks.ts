import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api-client";
import { TaskStatus } from "@/types/task";

export function useTasks(params: { status?: TaskStatus[]; search?: string } = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.listTasks(params),
    staleTime: 15_000,
  });
}
