import { ChevronLeft, ChevronRight, RotateCw, Home } from 'lucide-react'
import './AddressBar.css'

export default function AddressBar({
  pathSegments = ['home'],
  onGoHome,
  onBack,
  onForward,
  onRefresh,
  canGoBack = true,
  canGoForward = true,
}) {
  const pathLabel = pathSegments.join(' > ')

  return (
    <div className="address-bar" role="toolbar" aria-label="Browser navigation">
      <div className="address-bar__nav">
        <button
          type="button"
          className="address-bar__btn"
          aria-label="Back"
          disabled={!canGoBack}
          aria-disabled={!canGoBack}
          onClick={onBack}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="address-bar__btn"
          aria-label="Forward"
          disabled={!canGoForward}
          aria-disabled={!canGoForward}
          onClick={onForward}
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
        <button type="button" className="address-bar__btn" aria-label="Refresh" onClick={onRefresh}>
          <RotateCw size={16} strokeWidth={2.5} />
        </button>
        <button type="button" className="address-bar__btn" aria-label="Home" onClick={onGoHome}>
          <Home size={16} strokeWidth={2.5} />
        </button>
      </div>
      <div className="address-bar__url" aria-label="Page path" title={pathLabel}>
        <span className="address-bar__path">
          {pathSegments.map((segment, index) => (
            <span key={`${segment}-${index}`} className="address-bar__segment-wrap">
              {index > 0 ? <span className="address-bar__sep" aria-hidden="true"> &gt; </span> : null}
              <span
                className={
                  index === 0 && segment === 'home'
                    ? 'address-bar__segment address-bar__segment--root'
                    : 'address-bar__segment'
                }
              >
                {segment}
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
