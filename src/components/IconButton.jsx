export default function IconButton({ icon: Icon, label, onClick, active=false }) {
  return (
    <button className={`icon-button ${active ? 'active' : ''}`} onClick={onClick} aria-label={label} title={label}>
      <Icon size={20} strokeWidth={1.8} />
    </button>
  );
}
