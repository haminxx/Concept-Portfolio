import { cn } from '@/lib/utils'

export interface ImageSource {
  src: string
  alt: string
}

export interface RevealImageListItemData {
  id: string
  title: string
  dateLabel?: string
  images: [ImageSource, ImageSource]
}

type RevealImageListItemProps = {
  title: string
  dateLabel?: string
  images: [ImageSource, ImageSource]
  compact?: boolean
  isActive?: boolean
  onClick?: () => void
}

export function RevealImageListItem({
  title,
  dateLabel,
  images,
  compact = false,
  isActive = false,
  onClick,
}: RevealImageListItemProps) {
  const container = compact
    ? 'absolute -right-1 top-1/2 z-40 h-12 w-10 -translate-y-1/2'
    : 'absolute right-8 -top-1 z-40 h-20 w-16'

  const effect = compact
    ? 'relative h-10 w-8 scale-0 overflow-hidden rounded-md opacity-0 shadow-none transition-all delay-100 duration-500 group-hover/reveal:h-full group-hover/reveal:w-full group-hover/reveal:scale-100 group-hover/reveal:opacity-100 group-hover/reveal:shadow-lg'
    : 'relative h-16 w-16 scale-0 overflow-hidden rounded-md opacity-0 shadow-none transition-all delay-100 duration-500 group-hover/reveal:h-full group-hover/reveal:w-full group-hover/reveal:scale-100 group-hover/reveal:opacity-100 group-hover/reveal:shadow-xl'

  const titleClass = compact
    ? 'text-left text-[0.9375rem] font-bold leading-snug text-foreground transition duration-500 group-hover/reveal:opacity-40'
    : 'text-7xl font-black text-foreground transition duration-500 group-hover/reveal:opacity-40'

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group/reveal relative h-fit w-full overflow-visible text-left',
        compact ? 'py-3 pr-14' : 'py-8',
        onClick && 'cursor-pointer border-none bg-transparent',
        isActive && compact && 'opacity-100',
      )}
    >
      <p className={titleClass}>{title}</p>
      {dateLabel ? (
        <p className="mt-0.5 text-xs text-muted-foreground transition duration-500 group-hover/reveal:opacity-60">
          {dateLabel}
        </p>
      ) : null}

      <div className={container}>
        <div className={effect}>
          <img alt={images[1].alt} src={images[1].src} className="h-full w-full object-cover" />
        </div>
      </div>
      <div
        className={cn(
          container,
          compact
            ? 'translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover/reveal:translate-x-3 group-hover/reveal:translate-y-3 group-hover/reveal:rotate-12'
            : 'translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover/reveal:translate-x-6 group-hover/reveal:translate-y-6 group-hover/reveal:rotate-12',
        )}
      >
        <div className={cn(effect, 'duration-200')}>
          <img alt={images[0].alt} src={images[0].src} className="h-full w-full object-cover" />
        </div>
      </div>
    </Wrapper>
  )
}

type RevealImageListProps = {
  items: RevealImageListItemData[]
  header?: string
  compact?: boolean
  activeId?: string
  onSelect?: (id: string) => void
  className?: string
}

export function RevealImageList({
  items,
  header,
  compact = false,
  activeId,
  onSelect,
  className,
}: RevealImageListProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-sm bg-background',
        compact ? 'gap-0 px-4 py-3' : 'gap-1 px-8 py-4',
        className,
      )}
    >
      {header ? (
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {header}
        </h3>
      ) : null}
      {items.map((item) => (
        <RevealImageListItem
          key={item.id}
          title={item.title}
          dateLabel={item.dateLabel}
          images={item.images}
          compact={compact}
          isActive={activeId === item.id}
          onClick={onSelect ? () => onSelect(item.id) : undefined}
        />
      ))}
    </div>
  )
}
