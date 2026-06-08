import { useEffect, useState, useCallback, useMemo } from 'react'
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
  Navigation,
  Car,
  Footprints,
  Bike,
  Bus,
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
} from 'lucide-react'
import { Map, MapMarker, MarkerContent, MapRoute } from './ui/maplibre-map'
import { useLanguage } from '../context/LanguageContext'
import './MapWindow.css'

/* ── Base styles ── */
const POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
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

const INITIAL_VIEW = { center: [-117.726, 33.575], zoom: 10 }

/* ── Find Nearby categories (Apple Maps style) ── */
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
  { id: 'transit', label: 'Transit', icon: Bus },
]

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
  const [railExpanded, setRailExpanded] = useState(true)
  const [activeSection, setActiveSection] = useState('search')
  const [styleKey, setStyleKey] = useState('explore')
  const [styleMenuOpen, setStyleMenuOpen] = useState(false)
  const [bearing, setBearing] = useState(0)

  /* ── Search state ── */
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchView, setSearchView] = useState('main') // main | results | detail
  const [selected, setSelected] = useState(null)

  /* ── Directions state ── */
  const [dirFrom, setDirFrom] = useState('')
  const [dirTo, setDirTo] = useState('')
  const [dirProfile, setDirProfile] = useState('driving')
  const [route, setRoute] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [endpoints, setEndpoints] = useState(null)

  const styles = useMemo(() => STYLE_DEFS[styleKey], [styleKey])

  /* ── Track bearing for compass ── */
  useEffect(() => {
    if (!mapObj) return undefined
    const onRotate = () => setBearing(mapObj.getBearing())
    mapObj.on('rotate', onRotate)
    mapObj.on('rotateend', onRotate)
    onRotate()
    return () => {
      mapObj.off('rotate', onRotate)
      mapObj.off('rotateend', onRotate)
    }
  }, [mapObj])

  /* ── Map helpers ── */
  const flyTo = useCallback(
    (lng, lat, zoom = 15) => {
      mapObj?.flyTo({ center: [lng, lat], zoom, duration: 1200, essential: true })
    },
    [mapObj],
  )

  const zoomIn = useCallback(() => mapObj?.zoomTo(mapObj.getZoom() + 1, { duration: 300 }), [mapObj])
  const zoomOut = useCallback(() => mapObj?.zoomTo(mapObj.getZoom() - 1, { duration: 300 }), [mapObj])

  const setMapBearing = useCallback((deg) => mapObj?.easeTo({ bearing: deg, duration: 450 }), [mapObj])
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
  const handleNavClick = useCallback(
    (id) => {
      setActiveSection((prev) => (prev === id && railExpanded ? null : id))
      if (!railExpanded) setActiveSection(id)
    },
    [railExpanded],
  )

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
      flyTo(place.lng, place.lat, 15)
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
          mapObj.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 360, right: 80 }, duration: 900 })
        }
      }
    } catch {
      /* ignore */
    }
    setRouteLoading(false)
  }, [dirFrom, dirTo, dirProfile, mapObj])

  const startDirectionsFromPlace = useCallback(() => {
    if (!selected) return
    setDirFrom('My location')
    setDirTo(selected.address || selected.name)
    setActiveSection('directions')
  }, [selected])

  const routeCoords = route?.coords && route.coords.length >= 2 ? route.coords : null

  /* ════════════════════════════ Render ════════════════════════════ */
  return (
    <div className={`mw ${railExpanded ? 'mw--rail-expanded' : 'mw--rail-collapsed'}`}>
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
            <button
              type="button"
              className="mw__panel-close"
              onClick={() => setActiveSection(null)}
              aria-label="Close panel"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </header>

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
                <p className="mw__section-title">My Guides</p>
                <p className="mw__empty">Curated place collections will appear here.</p>
              </div>
            )}

            {/* ═══ DIRECTIONS ═══ */}
            {activeSection === 'directions' && (
              <>
                <div className="mw__dir-card">
                  <div className="mw__dir-field">
                    <span className="mw__dir-dot mw__dir-dot--from" />
                    <input
                      type="text"
                      className="mw__dir-input"
                      placeholder="From (or 'My location')"
                      value={dirFrom}
                      onChange={(e) => setDirFrom(e.target.value)}
                    />
                  </div>
                  <div className="mw__dir-divider" />
                  <div className="mw__dir-field">
                    <span className="mw__dir-dot mw__dir-dot--to" />
                    <input
                      type="text"
                      className="mw__dir-input"
                      placeholder="To"
                      value={dirTo}
                      onChange={(e) => setDirTo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDirections()}
                    />
                  </div>
                </div>

                <div className="mw__modes">
                  {TRANSPORT_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={`mw__mode${dirProfile === mode.id ? ' mw__mode--active' : ''}`}
                      onClick={() => setDirProfile(mode.id)}
                    >
                      <mode.icon size={16} strokeWidth={1.9} />
                      <span>{mode.label}</span>
                    </button>
                  ))}
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

        {/* Interactive compass */}
        <div className="mw__compass" style={{ '--mw-bearing': `${-bearing}deg` }}>
          <button
            type="button"
            className="mw__compass-dir mw__compass-dir--n"
            onClick={() => setMapBearing(0)}
            aria-label="Face north"
          >
            N
          </button>
          <button
            type="button"
            className="mw__compass-dir mw__compass-dir--e"
            onClick={() => setMapBearing(90)}
            aria-label="Face east"
          >
            E
          </button>
          <button
            type="button"
            className="mw__compass-dir mw__compass-dir--s"
            onClick={() => setMapBearing(180)}
            aria-label="Face south"
          >
            S
          </button>
          <button
            type="button"
            className="mw__compass-dir mw__compass-dir--w"
            onClick={() => setMapBearing(270)}
            aria-label="Face west"
          >
            W
          </button>
          <button type="button" className="mw__compass-needle" onClick={resetNorth} aria-label="Reset to north">
            <span className="mw__compass-needle-n" />
            <span className="mw__compass-needle-s" />
          </button>
        </div>
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
    </div>
  )
}
