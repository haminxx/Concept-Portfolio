/* eslint-disable react-refresh/only-export-components */
import MapLibreGL from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

const defaultStyles = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
}

const MapContext = createContext(null)

export function useMap() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMap must be used within a Map component')
  }
  return context
}

function getViewport(map) {
  const center = map.getCenter()
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60 [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export const Map = forwardRef(function Map(
  { children, className, theme = 'dark', styles, projection, viewport, onViewportChange, loading = false, ...props },
  ref,
) {
  const containerRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const currentStyleRef = useRef(null)
  const styleTimeoutRef = useRef(null)
  const internalUpdateRef = useRef(false)

  const isControlled = viewport !== undefined && onViewportChange !== undefined
  const onViewportChangeRef = useRef(onViewportChange)
  onViewportChangeRef.current = onViewportChange

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles],
  )

  useImperativeHandle(ref, () => mapInstance, [mapInstance])

  useEffect(() => {
    if (!containerRef.current) return undefined

    const initialStyle = theme === 'dark' ? mapStyles.dark : mapStyles.light
    currentStyleRef.current = initialStyle

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    })

    const clearStyleTimeout = () => {
      if (styleTimeoutRef.current) {
        clearTimeout(styleTimeoutRef.current)
        styleTimeoutRef.current = null
      }
    }

    const styleDataHandler = () => {
      clearStyleTimeout()
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true)
        if (projection) map.setProjection(projection)
      }, 100)
    }
    const loadHandler = () => setIsLoaded(true)
    const handleMove = () => {
      if (internalUpdateRef.current) return
      onViewportChangeRef.current?.(getViewport(map))
    }

    map.on('load', loadHandler)
    map.on('styledata', styleDataHandler)
    map.on('move', handleMove)
    setMapInstance(map)

    return () => {
      clearStyleTimeout()
      map.off('load', loadHandler)
      map.off('styledata', styleDataHandler)
      map.off('move', handleMove)
      map.remove()
      setIsLoaded(false)
      setIsStyleLoaded(false)
      setMapInstance(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return
    if (mapInstance.isMoving()) return

    const current = getViewport(mapInstance)
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    }

    if (
      next.center[0] === current.center[0] &&
      next.center[1] === current.center[1] &&
      next.zoom === current.zoom &&
      next.bearing === current.bearing &&
      next.pitch === current.pitch
    ) {
      return
    }

    internalUpdateRef.current = true
    mapInstance.jumpTo(next)
    internalUpdateRef.current = false
  }, [mapInstance, isControlled, viewport])

  useEffect(() => {
    if (!mapInstance || !theme) return

    const newStyle = theme === 'dark' ? mapStyles.dark : mapStyles.light
    if (currentStyleRef.current === newStyle) return

    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current)
      styleTimeoutRef.current = null
    }
    currentStyleRef.current = newStyle
    setIsStyleLoaded(false)
    mapInstance.setStyle(newStyle, { diff: true })
  }, [mapInstance, theme, mapStyles])

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, isLoaded, isStyleLoaded],
  )

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn('relative h-full w-full', className)}>
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  )
})

const MarkerContext = createContext(null)

function useMarkerContext() {
  const context = useContext(MarkerContext)
  if (!context) {
    throw new Error('Marker components must be used within MapMarker')
  }
  return context
}

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  ...markerOptions
}) {
  const { map } = useMap()

  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave })
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave }

  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement('div'),
      draggable,
    }).setLngLat([longitude, latitude])

    const el = markerInstance.getElement()
    el?.addEventListener('click', (e) => callbacksRef.current.onClick?.(e))
    el?.addEventListener('mouseenter', (e) => callbacksRef.current.onMouseEnter?.(e))
    el?.addEventListener('mouseleave', (e) => callbacksRef.current.onMouseLeave?.(e))

    return markerInstance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return undefined
    marker.addTo(map)
    return () => {
      marker.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude])
  }

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>
}

export function MarkerContent({ children, className }) {
  const { marker } = useMarkerContext()
  return createPortal(
    <div className={cn('relative cursor-pointer', className)}>{children || <DefaultMarkerIcon />}</div>,
    marker.getElement(),
  )
}

function DefaultMarkerIcon() {
  return <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
}

export function MapPopup({ longitude, latitude, onClose, children, className, ...popupOptions }) {
  const { map } = useMap()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const container = useMemo(() => document.createElement('div'), [])

  const popup = useMemo(() => {
    return new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeButton: false })
      .setMaxWidth('none')
      .setLngLat([longitude, latitude])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map) return undefined
    const onCloseProp = () => onCloseRef.current?.()
    popup.on('close', onCloseProp)
    popup.setDOMContent(container)
    popup.addTo(map)
    return () => {
      popup.off('close', onCloseProp)
      if (popup.isOpen()) popup.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  if (popup.isOpen() && (popup.getLngLat().lng !== longitude || popup.getLngLat().lat !== latitude)) {
    popup.setLngLat([longitude, latitude])
  }

  return createPortal(<div className={cn('relative', className)}>{children}</div>, container)
}

export function MapRoute({
  id: propId,
  coordinates,
  color = '#0a84ff',
  width = 5,
  opacity = 0.9,
  dashArray,
}) {
  const { map, isLoaded } = useMap()
  const autoId = useId()
  const id = propId ?? autoId
  const sourceId = `route-source-${id}`
  const layerId = `route-layer-${id}`
  const casingId = `route-casing-${id}`

  useEffect(() => {
    if (!isLoaded || !map) return undefined

    map.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
    })

    map.addLayer({
      id: casingId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': width + 3, 'line-opacity': 0.5 },
    })

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': opacity,
        ...(dashArray && { 'line-dasharray': dashArray }),
      },
    })

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(casingId)) map.removeLayer(casingId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  useEffect(() => {
    if (!isLoaded || !map || !coordinates || coordinates.length < 2) return
    const source = map.getSource(sourceId)
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates },
      })
    }
  }, [isLoaded, map, coordinates, sourceId])

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return
    map.setPaintProperty(layerId, 'line-color', color)
    map.setPaintProperty(layerId, 'line-width', width)
    map.setPaintProperty(layerId, 'line-opacity', opacity)
    if (map.getLayer(casingId)) map.setPaintProperty(casingId, 'line-width', width + 3)
  }, [isLoaded, map, layerId, casingId, color, width, opacity])

  return null
}
