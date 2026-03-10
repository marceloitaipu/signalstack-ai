'use client';

export function SidebarToggle({ isClose }: { isClose?: boolean }) {
  function toggle() {
    const panel = document.getElementById('sidebar-panel');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!panel || !backdrop) return;

    const isOpen = !panel.classList.contains('-translate-x-full');
    if (isOpen) {
      panel.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    } else {
      panel.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    }
  }

  if (isClose) {
    return (
      <button onClick={toggle} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close menu">
        ✕
      </button>
    );
  }

  return (
    <button onClick={toggle} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Open menu">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
