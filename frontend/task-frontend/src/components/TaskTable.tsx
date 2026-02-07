import type { Task } from "../api/tasks";
import StatusBadge from "./StatusBadge";

type Props = {
  tasks: Task[];
  onDelete: (id: number) => void;
  onOpen: (id: number) => void;
};

export default function TaskTable({ tasks, onDelete, onOpen }: Props) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks found</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(task => (
          <tr key={task.id}>
            <td onClick={() => onOpen(task.id)} style={{ cursor: "pointer" }}>
              <strong>{task.title}</strong>
            </td>
            <td><StatusBadge status={task.status} /></td>
            <td>{task.priority}</td>
            <td>
              <button className="danger" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
