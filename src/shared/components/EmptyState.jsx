export function EmptyState({ title, description }) {
  return (
    <div className="state-block state-block--empty">
      <p className="state-block__title">{title}</p>
      {description && <p className="state-block__description">{description}</p>}
    </div>
  );
}
