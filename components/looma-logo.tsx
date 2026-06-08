export function LoomaLogo({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Livro aberto estilizado formando uma mente/curva */}
        <path
          d="M20 9c-3.2-2.4-7-3-11-2.4-1.1.2-1.9 1.1-1.9 2.2v18.6c0 1.4 1.3 2.4 2.6 2.1 3.4-.7 6.8-.2 9.5 1.7.5.3 1.1.3 1.6 0 2.7-1.9 6.1-2.4 9.5-1.7 1.3.3 2.6-.7 2.6-2.1V8.8c0-1.1-.8-2-1.9-2.2-4-.6-7.8 0-11 2.4Z"
          fill="currentColor"
          fillOpacity="0.16"
        />
        <path
          d="M20 9v22M20 9c-3.2-2.4-7-3-11-2.4-1.1.2-1.9 1.1-1.9 2.2v18.6c0 1.4 1.3 2.4 2.6 2.1 3.4-.7 6.8-.2 9.5 1.7.5.3 1.1.3 1.6 0 2.7-1.9 6.1-2.4 9.5-1.7 1.3.3 2.6-.7 2.6-2.1V8.8c0-1.1-.8-2-1.9-2.2-4-.6-7.8 0-11 2.4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="6.5" r="2.6" fill="currentColor" />
      </svg>
    </span>
  )
}
