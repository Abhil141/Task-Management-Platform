import { useState } from "react";

type TaskInput = {
  title?: string;
};

type Props = {
  onSubmit: (data: TaskInput) => void;
  initialData?: TaskInput;
};

export default function TaskForm({ onSubmit, initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
