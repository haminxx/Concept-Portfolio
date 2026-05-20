export type BlogCardProps = {
  title: string
  date: string
  description: string
  onClick?: () => void
  href?: string
}

export function BlogCard({ title, date, description, onClick, href }: BlogCardProps) {
  const className =
    'blog-card group block w-full space-y-1 p-4 hover:cursor-pointer no-underline'

  const content = (
    <>
      <div className="blog-card__row relative flex min-w-0 items-center gap-2">
        <div className="shrink-0 whitespace-nowrap font-serif text-xl text-neutral-700 transition-colors duration-300 ease-out group-hover:text-[#ce624c] md:text-2xl">
          {title}
        </div>
        <span
          className="blog-card__leader min-w-[2rem] flex-1 border-b border-dashed border-neutral-400 transition-colors duration-300 ease-out group-hover:border-[#ce624c]"
          aria-hidden
        />
        <div className="shrink-0 whitespace-nowrap font-mono text-xs uppercase tracking-wide text-neutral-500 transition-colors duration-300 ease-out group-hover:text-[#ce624c] md:text-sm">
          {date}
        </div>
      </div>
      <div className="max-w-sm text-neutral-500 transition-all duration-500 ease-out group-hover:text-[#ce624c] md:max-w-full md:text-lg">
        {description}
      </div>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      className={className}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {content}
    </div>
  )
}
