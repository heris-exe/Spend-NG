import { Github, Linkedin, Instagram, ExternalLink } from 'lucide-react'

const LINKS = [
  { href: 'https://github.com/heris-exe', label: 'GitHub', Icon: Github },
  { href: 'https://www.linkedin.com/in/heris-exe/', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://www.instagram.com/heris.exe/', label: 'Instagram', Icon: Instagram },
  { href: 'https://substack.com/@heris24', label: 'Substack', Icon: ExternalLink },
]

export default function AppFooter() {
  return (
    <footer className="mt-8 rounded-xl border border-border bg-card px-4 py-4 text-center text-xs text-muted-foreground shadow-sm sm:mt-12 sm:px-5 sm:py-5">
      <p className="mb-3">Export or import expenses as JSON, CSV, or Excel from the Expenses page.</p>
      <p className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
        <span>Made by</span>
        <a
          href="https://github.com/heris-exe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:underline focus:underline focus:outline-none"
        >
          <img
            src="/heris-avatar.png"
            alt=""
            className="size-5 shrink-0 rounded-full object-cover"
            width={20}
            height={20}
          />
          heris.exe
        </a>
        <span className="sr-only sm:not-sr-only sm:inline"> · </span>
        <span className="flex items-center justify-center gap-2">
          {LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none"
              title={label}
              aria-label={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </span>
      </p>
    </footer>
  )
}
