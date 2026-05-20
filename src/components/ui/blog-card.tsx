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
      <div className="relative flex items-end justify-center gap-1">
        <div className="whitespace-nowrap font-serif text-xl text-neutral-700 transition-all duration-500 ease-out group-hover:text-[#ce624c] md:text-2xl">
          {title}
        </div>
        <span className="mb-[6px] w-full border-b-[0.5px] border-dashed border-neutral-400 transition-colors duration-500 ease-out group-hover:border-[#ce624c]" />
        <div className="whitespace-nowrap font-mono text-xs uppercase text-neutral-500 transition-all duration-500 ease-out group-hover:text-[#ce624c] md:text-base">
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
