import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Grid3X3, LayoutGrid, X, ZoomIn } from 'lucide-react'
import { GALLERY_PHOTOS } from '../config/galleryManifest.js'
import { ADD_PHOTO_WIDGET_EVENT } from '../lib/photoWidgetRegistry'
import { cn } from '../lib/utils'
import './GalleryWindow.css'

/**
 * Real gallery data is sourced from src/config/galleryManifest.js (45 photos in
 * public/gallery/photo-*.png). `id` is the stable manifest index so the lightbox
 * "add to desktop" action keeps working with photo widgets. Generic "Photo N"
 * titles map to the "Backgrounds" category; the hand-titled imports map to
 * "Inspiration".
 */
const galleryImages = GALLERY_PHOTOS.map((photo, index) => ({
  id: index,
  url: photo.src,
  title: photo.title,
  category: /^Photo \d+$/.test(photo.title) ? 'Backgrounds' : 'Inspiration',
}))

function Badge({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

function FilterButton({ active, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-transparent text-foreground hover:bg-accent',
        className,
      )}
      {...props}
    />
  )
}

function IconButton({ className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10',
        className,
      )}
      {...props}
    />
  )
}

export default function GalleryWindow() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...new Set(galleryImages.map((img) => img.category))]
  const filteredImages =
    filter === 'All' ? galleryImages : galleryImages.filter((img) => img.category === filter)

  const selectedImageData = galleryImages.find((img) => img.id === selectedImage)

  const handleNext = () => {
    if (selectedImage === null || filteredImages.length === 0) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage)
    const nextIndex = (currentIndex + 1) % filteredImages.length
    setSelectedImage(filteredImages[nextIndex].id)
  }

  const handlePrev = () => {
    if (selectedImage === null || filteredImages.length === 0) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage)
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
    setSelectedImage(filteredImages[prevIndex].id)
  }

  const handleCardKeyDown = (event, imageId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedImage(imageId)
    }
  }

  useEffect(() => {
    if (selectedImage === null) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedImage(null)
      else if (event.key === 'ArrowRight') handleNext()
      else if (event.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, filter])

  const addToDesktop = () => {
    if (selectedImage === null) return
    window.dispatchEvent(
      new CustomEvent(ADD_PHOTO_WIDGET_EVENT, { detail: { galleryIndex: selectedImage } }),
    )
  }

  return (
    <section
      className="gallery-window flex h-full flex-col bg-background text-foreground"
      aria-labelledby="gallery-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="shrink-0 px-6 pb-3 pt-6 text-center"
      >
        <Badge className="mb-3">
          <Grid3X3 className="h-3 w-3" />
          Gallery
        </Badge>
        <h2 id="gallery-heading" className="mb-1 text-2xl font-bold tracking-tight">
          My Portfolio
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          A collection of visuals and creative work
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="shrink-0 flex flex-wrap justify-center gap-2 px-6 pb-4"
        role="group"
        aria-label="Gallery categories"
      >
        {categories.map((category) => (
          <FilterButton
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
            aria-pressed={filter === category}
          >
            {category}
          </FilterButton>
        ))}
      </motion.div>

      <div className="gallery-window__scroll min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Gallery items"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                role="listitem"
              >
                <div
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border transition-all hover:border-ring hover:shadow-xl"
                  onClick={() => setSelectedImage(image.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, image.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${image.title}`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <motion.img
                      src={image.url}
                      alt={image.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
                      aria-hidden="true"
                    >
                      <ZoomIn className="mb-2 h-7 w-7 text-white" />
                      <h3 className="mb-2 text-center text-base font-semibold text-white">
                        {image.title}
                      </h3>
                      <Badge>{image.category}</Badge>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedImage !== null && selectedImageData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-dialog-title"
            aria-describedby="gallery-dialog-description"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] max-w-5xl flex-col items-center"
            >
              <div className="absolute right-2 top-2 z-10 flex gap-2">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    addToDesktop()
                  }}
                  aria-label="Add photo to desktop"
                  title="Add to desktop"
                >
                  <LayoutGrid className="h-5 w-5" />
                </IconButton>
                <IconButton
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close gallery dialog"
                >
                  <X className="h-5 w-5" />
                </IconButton>
              </div>
              {filteredImages.length > 1 && (
                <>
                  <IconButton
                    className="absolute left-1 top-1/2 -translate-y-1/2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrev()
                    }}
                    aria-label="View previous image"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </IconButton>
                  <IconButton
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                    aria-label="View next image"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </IconButton>
                </>
              )}
              <motion.img
                key={selectedImage}
                src={selectedImageData.url}
                alt={selectedImageData.title}
                className="max-h-[78vh] w-auto rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-center text-white"
                id="gallery-dialog-description"
              >
                <h3 className="mb-2 text-lg font-semibold" id="gallery-dialog-title">
                  {selectedImageData.title}
                </h3>
                <Badge>{selectedImageData.category}</Badge>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
