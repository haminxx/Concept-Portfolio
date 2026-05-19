import { ChevronLeft, ChevronRight, RotateCw, Home } from 'lucide-react'
import { MouseFollowingEyes } from '@/components/ui/mouse-following-eyes'
import './AddressBar.css'

export default function AddressBar({
  onGoHome,
  onBack,
  onForward,
  onRefresh,
  canGoBack = true,
  canGoForward = true,
}) {
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
      <div className="address-bar__eyes">
        <MouseFollowingEyes trackWindow />
      </div>
    </div>
  )
}
