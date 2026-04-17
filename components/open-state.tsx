export function OpenState({ open }: { open?: boolean | null }) {
  if (open == null) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${open ? 'bg-success' : 'bg-danger'}`} />
      <span className={open ? 'text-success' : 'text-danger'}>{open ? 'Open now' : 'Closed'}</span>
    </span>
  );
}
