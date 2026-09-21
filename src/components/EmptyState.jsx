import './EmptyState.css';

export default function EmptyState({ icon, titulo }) {
  return (
    <div className="tabla-vacia">
      {icon}
      <p className="tabla-vacia-titulo">{titulo}</p>
    </div>
  );
}
