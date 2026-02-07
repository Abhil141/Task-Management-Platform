type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  const colors: Record<string, string> = {
    todo: "#6b7280",
    in_progress: "#2563eb",
    done: "#16a34a",
  };

  return (
    <span style={{
      padding: "4px 10px",
      borderRadius: 12,
      color: "white",
      background: colors[status],
      fontSize: 12
    }}>
      {status.replace("_", " ")}
    </span>
  );
}
