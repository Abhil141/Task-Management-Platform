type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="card">
      <p>{message}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="danger" onClick={onConfirm}>
          Confirm
        </button>
        <button className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
