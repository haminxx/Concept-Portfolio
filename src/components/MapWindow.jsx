import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  Search,
  LayoutGrid,
  CornerUpRight,
  PanelLeft,
  X,
  Plus,
  Minus,
  Locate,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Navigation,
  Navigation2,
  Car,
  Footprints,
  Bike,
  MapPin,
  Map as MapIcon,
  Layers,
  Beef,
  UtensilsCrossed,
  Fuel,
  Hotel,
  ShoppingCart,
  Coffee,
  Store,
  Binoculars,
  Maximize2,
  Share,
  GripVertical,
  Clock,
} from 'lucide-react'
import { Map, MapMarker, MarkerContent, MapRoute } from './ui/maplibre-map'
import { useLanguage } from '../context/LanguageContext'
import {
  POI_PLACES,
  POI_CATEGORIES,
  POI_MIN_ZOOM,
  GUIDES_REGION,
  GUIDES_FEATURED,
  GUIDES_SECTIONS,
} from './mapData'
import './MapWindow.css'

/* ── Base styles ── */
const VOYAGER = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite', minzoom: 0, maxzoom: 22 }],
}
const STYLE_DEFS = {
  explore: { light: VOYAGER, dark: VOYAGER },
  satellite: { light: SATELLITE_STYLE, dark: SATELLITE_STYLE },
}
const INITIAL_VIEW = { center: [-117.234, 32.8801], zoom: 12.5 }

const CATEGORIES = [
  { id: 'fast food', label: 'Fast Food', icon: Beef, color: '#FF9F0A' },
  { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed, color: '#FF9500' },
  { id: 'fuel', label: 'Gas Stations', icon: Fuel, color: '#0A84FF' },
  { id: 'hotel', label: 'Hotels', icon: Hotel, color: '#BF5AF2' },
  { id: 'supermarket', label: 'Groceries', icon: ShoppingCart, color: '#FFD60A' },
  { id: 'cafe', label: 'Coffee', icon: Coffee, color: '#FF9500' },
  { id: 'convenience', label: 'Convenience', icon: Store, color: '#30D158' },
]
const NAV_ITEMS = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'guides', label: 'Guides', icon: LayoutGrid },
  { id: 'directions', label: 'Directions', icon: CornerUpRight },
]
const TRANSPORT_MODES = [
  { id: 'driving', label: 'Drive', icon: Car },
  { id: 'walking', label: 'Walk', icon: Footprints },
  { id: 'cycling', label: 'Cycle', icon: Bike },
]

/* ── Recents persistence ── */
const RECENTS_KEY = 'map-recents-v2'
function loadRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) || []
  } catch {
    return []
  }
}
function saveRecent(place) {
  const list = loadRecents().filter((r) => r.name !== place.name)
  const next = [{ name: place.name, address: place.address, lng: place.lng, lat: place.lat }, ...list].slice(0, 6)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  return next
}

/* ── Geocode (Nominatim) ── */
async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } },
  )
  const data = await res.json()
  if (!Array.isArray(data)) return []
  return data.map((d) => ({
    name: d.name || d.display_name.split(',')[0],
    address: d.display_name,
    lng: parseFloat(d.lon),
    lat: parseFloat(d.lat),
  }))
}

/* ── Route (OSRM) ── */
async function routeOSRM(fromLat, fromLng, toLat, toLng, profile = 'driving') {
  const osrmProfile = profile === 'walking' ? 'foot' : profile === 'cycling' ? 'bike' : 'driving'
  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`
  const res = await fetch(url)
  const data = await res.json()
  if (data.code !== 'Ok' || !data.routes?.[0]) return null
  const route = data.routes[0]
  return {
    coords: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
    steps: route.legs?.[0]?.steps?.map((s) => s.maneuver?.instruction || s.name).filter(Boolean) || [],
  }
}

const fmtDist = (m) => {
  if (!m) return ''
  const mi = m / 1609.34
  return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`
}
const fmtTime = (s) => {
  if (!s) return ''
  const m = Math.round(s / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr ${m % 60} min`
}

/* ════════════════════════════════════════════ */
export default function MapWindow() {
  const { t } = useLanguage()
  const [mapObj, setMapObj] = useState(null)

  /* ── Chrome state ── */
  const [railExpanded, setRailExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [styleKey, setStyleKey] = useState('explore')
  const [styleMenuOpen, setStyleMenuOpen] = useState(false)
  const [bearing, setBearing] = useState(0)
  const [zoom, setZoom] = useState(INITIAL_VIEW.zoom)
  const [recents, setRecents] = useState(loadRecents)

  /* ── Search state ── */
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchView, setSearchView] = useState('main')
  const [selected, setSelected] = useState(null)

  /* ── Directions state ── */
  const [dirFrom, setDirFrom] = useState('My Location')
  const [dirTo, setDirTo] = useState('')
  const [dirProfile, setDirProfile] = useState('driving')
  const [route, setRoute] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [endpoints, setEndpoints] = useState(null)

  /* ── Street view state ── */
  const [svDragging, setSvDragging] = useState(false)
  const [svDragPos, setSvDragPos] = useState({ x: 0, y: 0 })
  const [streetView, setStreetView] = useState(null) // { lng, lat, heading }
  const [svExpanded, setSvExpanded] = useState(false)
  const svDraggingRef = useRef(false)

  const styles = useMemo(() => STYLE_DEFS[styleKey], [styleKey])

  /* ── Track bearing + zoom ── */
  useEffect(() => {
    if (!mapObj) return undefined
    const onRotate = () => setBearing(mapObj.getBearing())
    const onZoom = () => setZoom(mapObj.getZoom())
    mapObj.on('rotate', onRotate)
    mapObj.on('rotateend', onRotate)
    mapObj.on('zoom', onZoom)
    onRotate()
    onZoom()
    return () => {
      mapObj.off('rotate', onRotate)
      mapObj.off('rotateend', onRotate)
      mapObj.off('zoom', onZoom)
    }
  }, [mapObj])

  /* ── Map helpers ── */
  const flyTo = useCallback(
    (lng, lat, z = 15) => mapObj?.flyTo({ center: [lng, lat], zoom: z, duration: 1200, essential: true }),
    [mapObj],
  )
  const zoomIn = useCallback(() => mapObj?.zoomTo(mapObj.getZoom() + 1, { duration: 300 }), [mapObj])
  const zoomOut = useCallback(() => mapObj?.zoomTo(mapObj.getZoom() - 1, { duration: 300 }), [mapObj])
  const resetNorth = useCallback(() => mapObj?.easeTo({ bearing: 0, pitch: 0, duration: 450 }), [mapObj])

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => flyTo(pos.coords.longitude, pos.coords.latitude, 14),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [flyTo])

  /* ── Nav handling ── */
  const handleNavClick = useCallback((id) => {
    setActiveSection((prev) => (prev === id ? null : id))
  }, [])

  /* ── Search ── */
  const runSearch = useCallback(async (q) => {
    const term = q.trim()
    if (!term) return
    setSearching(true)
    setSearchView('results')
    try {
      setResults(await geocode(term))
    } catch {
      setResults([])
    }
    setSearching(false)
  }, [])

  const selectPlace = useCallback(
    (place) => {
      setSelected(place)
      setSearchView('detail')
      setActiveSection('search')
      flyTo(place.lng, place.lat, 15)
      setRecents(saveRecent(place))
    },
    [flyTo],
  )

  const backToSearchMain = useCallback(() => {
    setSearchView('main')
    setResults([])
    setSelected(null)
  }, [])

  /* ── Directions ── */
  const handleDirections = useCallback(async () => {
    if (!dirFrom.trim() || !dirTo.trim()) return
    setRouteLoading(true)
    setRoute(null)
    setEndpoints(null)
    try {
      let fromCoord
      let toCoord
      if (dirFrom.trim().toLowerCase() === 'my location') {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            reject,
            { enableHighAccuracy: true, timeout: 8000 },
          ),
        )
        fromCoord = pos
      } else {
        const r = await geocode(dirFrom)
        if (r[0]) fromCoord = r[0]
      }
      const toResults = await geocode(dirTo)
      if (toResults[0]) toCoord = toResults[0]
      if (!fromCoord || !toCoord) {
        setRouteLoading(false)
        return
      }
      setEndpoints({ from: fromCoord, to: toCoord })
      const data = await routeOSRM(fromCoord.lat, fromCoord.lng, toCoord.lat, toCoord.lng, dirProfile)
      if (data) {
        setRoute(data)
        if (mapObj && data.coords.length) {
          const bounds = data.coords.reduce(
            (b, c) => [
              [Math.min(b[0][0], c[0]), Math.min(b[0][1], c[1])],
              [Math.max(b[1][0], c[0]), Math.max(b[1][1], c[1])],
            ],
            [
              [data.coords[0][0], data.coords[0][1]],
              [data.coords[0][0], data.coords[0][1]],
            ],
          )
          mapObj.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 380, right: 80 }, duration: 900 })
        }
      }
    } catch {
      /* ignore */
    }
    setRouteLoading(false)
  }, [dirFrom, dirTo, dirProfile, mapObj])

  const startDirectionsFromPlace = useCallback(() => {
    if (!selected) return
    setDirFrom('My Location')
    setDirTo(selected.address || selected.name)
    setActiveSection('directions')
  }, [selected])

  const routeCoords = route?.coords && route.coords.length >= 2 ? route.coords : null

  /* ── Street view drag ── */
  const placeStreetView = useCallback(
    (clientX, clientY) => {
      if (!mapObj) return
      const container = mapObj.getContainer()
      const rect = container.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
      const lngLat = mapObj.unproject([x, y])
      setStreetView({ lng: lngLat.lng, lat: lngLat.lat, heading: 0 })
      setSvExpanded(false)
    },
    [mapObj],
  )

  const startSvDrag = useCallback((e) => {
    e.preventDefault()
    svDraggingRef.current = true
    setSvDragging(true)
    setSvDragPos({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    if (!svDragging) return undefined
    const onMove = (e) => setSvDragPos({ x: e.clientX, y: e.clientY })
    const onUp = (e) => {
      svDraggingRef.current = false
      setSvDragging(false)
      placeStreetView(e.clientX, e.clientY)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [svDragging, placeStreetView])

  const svUrl = streetView
    ? `https://maps.google.com/maps?q=&layer=c&cbll=${streetView.lat},${streetView.lng}&cbp=11,${streetView.heading || 0},0,0,0&output=svembed`
    : null

  /* POIs visible only when zoomed in enough */
  const showPois = zoom >= POI_MIN_ZOOM

  /* ════════════════════════════ Render ════════════════════════════ */
  return (
    <div
      className={`mw ${railExpanded ? 'mw--rail-expanded' : 'mw--rail-collapsed'}${activeSection ? ' mw--panel-open' : ''}`}
    >
      {/* Map base */}
      <Map
        ref={setMapObj}
        theme="light"
        styles={styles}
        className="mw__map"
        center={INITIAL_VIEW.center}
        zoom={INITIAL_VIEW.zoom}
        attributionControl={false}
      >
        {/* Zoom-gated POIs */}
        {showPois &&
          POI_PLACES.map((poi) => {
            const cat = POI_CATEGORIES[poi.category] || POI_CATEGORIES.default
            return (
              <MapMarker
                key={poi.id}
                longitude={poi.lng}
                latitude={poi.lat}
                anchor="left"
                onClick={() => selectPlace({ name: poi.name, address: poi.name, lng: poi.lng, lat: poi.lat })}
              >
                <MarkerContent>
                  <span className="mw__poi">
                    <span className="mw__poi-ico" style={{ background: cat.color }}>
                      <cat.icon size={12} strokeWidth={2.2} />
                    </span>
                    <span className="mw__poi-label">{poi.name}</span>
                  </span>
                </MarkerContent>
              </MapMarker>
            )
          })}

        {/* Search / route markers */}
        {selected && (
          <MapMarker longitude={selected.lng} latitude={selected.lat}>
            <MarkerContent>
              <span className="mw__pin" />
            </MarkerContent>
          </MapMarker>
        )}
        {endpoints && (
          <>
            <MapMarker longitude={endpoints.from.lng} latitude={endpoints.from.lat}>
              <MarkerContent>
                <span className="mw__pin mw__pin--start" />
              </MarkerContent>
            </MapMarker>
            <MapMarker longitude={endpoints.to.lng} latitude={endpoints.to.lat}>
              <MarkerContent>
                <span className="mw__pin mw__pin--end" />
              </MarkerContent>
            </MapMarker>
          </>
        )}
        {routeCoords && <MapRoute coordinates={routeCoords} color="#0a84ff" width={6} />}

        {/* Street-view pegman on map */}
        {streetView && (
          <MapMarker
            longitude={streetView.lng}
            latitude={streetView.lat}
            draggable
            onDragEnd={({ lng, lat }) => setStreetView((sv) => ({ ...sv, lng, lat }))}
          >
            <MarkerContent>
              <span className="mw__pegman">
                <Binoculars size={15} strokeWidth={2} />
              </span>
            </MarkerContent>
          </MapMarker>
        )}
      </Map>

      {/* ── Left icon rail ── */}
      <nav className="mw__rail">
        <button
          type="button"
          className="mw__rail-toggle"
          onClick={() => setRailExpanded((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} strokeWidth={1.9} />
        </button>

        {railExpanded && (
          <div className="mw__brand">
            <span className="mw__brand-apple"></span>
            <span className="mw__brand-name">Maps</span>
            <span className="mw__brand-beta">BETA</span>
          </div>
        )}

        <div className="mw__rail-items">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mw__rail-item${activeSection === item.id ? ' mw__rail-item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              aria-label={item.label}
            >
              <span className="mw__rail-item-ico">
                <item.icon size={18} strokeWidth={1.9} />
              </span>
              {railExpanded && <span className="mw__rail-item-label">{item.label}</span>}
            </button>
          ))}
        </div>

        {railExpanded && recents.length > 0 && (
          <div className="mw__rail-recents">
            <p className="mw__rail-recents-head">
              Recents <ChevronRight size={13} strokeWidth={2.4} />
            </p>
            {recents.slice(0, 4).map((r, i) => (
              <button key={i} type="button" className="mw__rail-recent" onClick={() => selectPlace(r)}>
                <span className="mw__rail-recent-ico">
                  <Clock size={13} strokeWidth={2} />
                </span>
                <span className="mw__rail-recent-name">{r.name}</span>
              </button>
            ))}
          </div>
        )}

        {railExpanded && (
          <div className="mw__rail-footer">
            <span className="mw__rail-footer-top">Have a Business on Maps?</span>
            <span className="mw__rail-footer-link">Manage Your Business ↗</span>
          </div>
        )}
      </nav>

      {/* ── Secondary frosted panel ── */}
      {activeSection && (
        <section className="mw__panel">
          <header className="mw__panel-head">
            <h2 className="mw__panel-title">
              {activeSection === 'search' && 'Search'}
              {activeSection === 'guides' && 'Guides'}
              {activeSection === 'directions' && 'Directions'}
            </h2>
            <div className="mw__panel-head-actions">
              {activeSection === 'directions' && (
                <button type="button" className="mw__panel-icon-btn" aria-label="Share">
                  <Share size={15} strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                className="mw__panel-icon-btn"
                onClick={() => setActiveSection(null)}
                aria-label="Close panel"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>
          </header>

          {activeSection === 'guides' && (
            <div className="mw__panel-subtitle">
              {GUIDES_REGION} <ChevronDown size={15} strokeWidth={2.4} />
            </div>
          )}

          <div className="mw__panel-body">
            {/* ═══ SEARCH ═══ */}
            {activeSection === 'search' && (
              <>
                <div className="mw__search-bar">
                  <Search size={16} strokeWidth={2} className="mw__search-ico" />
                  <input
                    type="text"
                    className="mw__search-input"
                    placeholder={t('map.searchPlaceholder') || 'Apple Maps'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
                  />
                  {query && (
                    <button type="button" className="mw__clear" onClick={() => setQuery('')} aria-label="Clear">
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                {searchView === 'main' && (
                  <div className="mw__nearby">
                    <p className="mw__section-title">Find Nearby</p>
                    <div className="mw__nearby-list">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className="mw__nearby-row"
                          onClick={() => {
                            setQuery(cat.label)
                            runSearch(cat.id)
                          }}
                        >
                          <span className="mw__nearby-ico" style={{ background: cat.color }}>
                            <cat.icon size={16} strokeWidth={2} />
                          </span>
                          <span className="mw__nearby-label">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchView === 'results' && (
                  <div className="mw__slide">
                    <button type="button" className="mw__back" onClick={backToSearchMain}>
                      <ChevronLeft size={17} strokeWidth={2.2} />
                      <span>Find Nearby</span>
                    </button>
                    <p className="mw__section-title">{searching ? 'Searching…' : `${results.length} Results`}</p>
                    {results.map((r, i) => (
                      <button key={i} type="button" className="mw__place-row" onClick={() => selectPlace(r)}>
                        <MapPin size={15} strokeWidth={1.9} className="mw__row-ico" />
                        <span className="mw__row-info">
                          <span className="mw__row-name">{r.name}</span>
                          <span className="mw__row-addr">{r.address}</span>
                        </span>
                        <ChevronRight size={15} className="mw__row-chevron" />
                      </button>
                    ))}
                    {!searching && results.length === 0 && <p className="mw__empty">No results found.</p>}
                  </div>
                )}

                {searchView === 'detail' && selected && (
                  <div className="mw__slide">
                    <button type="button" className="mw__back" onClick={backToSearchMain}>
                      <ChevronLeft size={17} strokeWidth={2.2} />
                      <span>Results</span>
                    </button>
                    <h3 className="mw__detail-name">{selected.name}</h3>
                    <p className="mw__detail-addr">{selected.address}</p>
                    <div className="mw__detail-actions">
                      <button type="button" className="mw__action mw__action--primary" onClick={startDirectionsFromPlace}>
                        <span className="mw__action-ico">
                          <Navigation size={18} strokeWidth={2} />
                        </span>
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══ GUIDES ═══ */}
            {activeSection === 'guides' && (
              <div className="mw__guides">
                <div className="mw__guide-hero" style={{ backgroundImage: `url(${GUIDES_FEATURED.image})` }}>
                  <div className="mw__guide-hero-text">
                    <span className="mw__guide-brand">🌲 {GUIDES_FEATURED.brand}</span>
                    <span className="mw__guide-hero-title">{GUIDES_FEATURED.title}</span>
                  </div>
                </div>

                {GUIDES_SECTIONS.map((sec) => (
                  <div key={sec.id} className="mw__guide-section">
                    <p className="mw__guide-section-title">
                      {sec.title} <ChevronRight size={15} strokeWidth={2.4} />
                    </p>
                    <div className="mw__guide-cards">
                      {sec.cards.map((card) => (
                        <div
                          key={card.id}
                          className="mw__guide-card"
                          style={{ backgroundImage: `url(${card.image})` }}
                        >
                          <div className="mw__guide-card-text">
                            <span className="mw__guide-card-brand">{card.brand}</span>
                            <span className="mw__guide-card-title">{card.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══ DIRECTIONS ═══ */}
            {activeSection === 'directions' && (
              <>
                <div className="mw__segment">
                  {TRANSPORT_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={`mw__segment-btn${dirProfile === mode.id ? ' mw__segment-btn--active' : ''}`}
                      onClick={() => setDirProfile(mode.id)}
                      aria-label={mode.label}
                    >
                      <mode.icon size={18} strokeWidth={2} />
                    </button>
                  ))}
                </div>

                <div className="mw__dir-card">
                  <div className="mw__dir-field">
                    <span className="mw__dir-dot mw__dir-dot--from">
                      <Navigation2 size={11} strokeWidth={2.4} fill="currentColor" />
                    </span>
                    <input
                      type="text"
                      className="mw__dir-input"
                      placeholder="My Location"
                      value={dirFrom}
                      onChange={(e) => setDirFrom(e.target.value)}
                    />
                    <GripVertical size={15} className="mw__dir-grip" />
                  </div>
                  <div className="mw__dir-connector" />
                  <div className="mw__dir-field">
                    <span className="mw__dir-dot mw__dir-dot--to">
                      <Plus size={11} strokeWidth={3} />
                    </span>
                    <input
                      type="text"
                      className="mw__dir-input"
                      placeholder="To"
                      value={dirTo}
                      onChange={(e) => setDirTo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDirections()}
                    />
                    <GripVertical size={15} className="mw__dir-grip" />
                  </div>
                  <div className="mw__dir-field mw__dir-field--add">
                    <span className="mw__dir-dot mw__dir-dot--add">
                      <Plus size={11} strokeWidth={3} />
                    </span>
                    <span className="mw__dir-addstop">Add Stop</span>
                  </div>
                </div>

                <div className="mw__chips">
                  <button type="button" className="mw__chip">
                    Now <ChevronDown size={13} strokeWidth={2.4} />
                  </button>
                  <button type="button" className="mw__chip">
                    Avoid <ChevronDown size={13} strokeWidth={2.4} />
                  </button>
                </div>

                <button
                  type="button"
                  className="mw__go"
                  onClick={handleDirections}
                  disabled={routeLoading || !dirFrom.trim() || !dirTo.trim()}
                >
                  {routeLoading ? 'Routing…' : 'Get Directions'}
                </button>

                {route && (
                  <div className="mw__route">
                    <div className="mw__route-summary">
                      <span className="mw__route-time">{fmtTime(route.duration)}</span>
                      <span className="mw__route-dist">{fmtDist(route.distance)}</span>
                    </div>
                    {route.steps.length > 0 && (
                      <ol className="mw__route-steps">
                        {route.steps.slice(0, 20).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Top-right controls ── */}
      <div className="mw__top-right">
        <div className="mw__ctrl-group">
          <button
            type="button"
            className={`mw__ctrl-btn${styleMenuOpen ? ' mw__ctrl-btn--active' : ''}`}
            onClick={() => setStyleMenuOpen((v) => !v)}
            aria-label="Map style"
          >
            <Layers size={17} strokeWidth={1.9} />
          </button>
          {styleMenuOpen && (
            <div className="mw__style-menu">
              <button
                type="button"
                className={`mw__style-opt${styleKey === 'explore' ? ' mw__style-opt--active' : ''}`}
                onClick={() => {
                  setStyleKey('explore')
                  setStyleMenuOpen(false)
                }}
              >
                <MapIcon size={16} strokeWidth={1.9} />
                <span>Explore</span>
              </button>
              <button
                type="button"
                className={`mw__style-opt${styleKey === 'satellite' ? ' mw__style-opt--active' : ''}`}
                onClick={() => {
                  setStyleKey('satellite')
                  setStyleMenuOpen(false)
                }}
              >
                <Layers size={16} strokeWidth={1.9} />
                <span>Satellite</span>
              </button>
            </div>
          )}
        </div>

        <div className="mw__ctrl-group">
          <button type="button" className="mw__ctrl-btn" onClick={locateUser} aria-label="Current location">
            <Locate size={17} strokeWidth={1.9} />
          </button>
        </div>

        {/* Minimal interactive compass */}
        <button
          type="button"
          className="mw__compass"
          style={{ '--mw-bearing': `${-bearing}deg` }}
          onClick={resetNorth}
          aria-label="Reset bearing to north"
        >
          <span className="mw__compass-dial">
            <span className="mw__compass-n" />
            <span className="mw__compass-s" />
          </span>
        </button>
      </div>

      {/* ── Bottom-right zoom ── */}
      <div className="mw__zoom">
        <button type="button" className="mw__zoom-btn" onClick={zoomIn} aria-label="Zoom in">
          <Plus size={18} strokeWidth={2.2} />
        </button>
        <span className="mw__zoom-sep" />
        <button type="button" className="mw__zoom-btn" onClick={zoomOut} aria-label="Zoom out">
          <Minus size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* ── Bottom-left street-view binoculars ── */}
      {!streetView && (
        <button
          type="button"
          className={`mw__sv-grab${svDragging ? ' mw__sv-grab--dragging' : ''}`}
          onPointerDown={startSvDrag}
          aria-label="Drag to view street level"
          title="Drag onto the map for Street View"
        >
          <Binoculars size={18} strokeWidth={1.9} />
        </button>
      )}

      {/* Drag ghost */}
      {svDragging && (
        <span className="mw__sv-ghost" style={{ left: svDragPos.x, top: svDragPos.y }}>
          <Binoculars size={18} strokeWidth={2} />
        </span>
      )}

      {/* Street-view card */}
      {streetView && svUrl && (
        <div className={`mw__sv-card${svExpanded ? ' mw__sv-card--expanded' : ''}`}>
          <iframe
            key={`${streetView.lng},${streetView.lat}`}
            title="Street View"
            className="mw__sv-frame"
            src={svUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="mw__sv-controls">
            <button
              type="button"
              className="mw__sv-ctrl"
              onClick={() => setSvExpanded((v) => !v)}
              aria-label="Expand"
            >
              <Maximize2 size={16} strokeWidth={2.2} />
            </button>
            <button type="button" className="mw__sv-done" onClick={() => setStreetView(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
