'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TravelPin } from '@/app/(dashboard)/lifestyle/viajes/actions';
import { Layers } from 'lucide-react';

interface Props {
  center: [number, number]; // [latitud, longitud]
  zoom: number;
  pins: TravelPin[];
  onPinSelect: (pin: TravelPin) => void;
  onMapClick: (lat: number, lng: number) => void;
}

// Opciones de estilos de mapas reales (Tiles)
const TILE_LAYERS = {
  dark: {
    name: 'Oscuro Premium',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  light: {
    name: 'Claro Minimalista',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    name: 'Satélite Global',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Sub-componente para controlar de forma reactiva el centro y zoom del mapa Leaflet
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Sub-componente para capturar clics libres sobre el mapa real
function ClickCapturer({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Generador nativo de L.divIcon para pintar marcadores HTML dinámicos ultra elegantes
const createCustomDivIcon = (color: string, name: string, status: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="marker-wrapper ${status}" style="--marker-color: ${color};">
        <div class="marker-dot"></div>
        <div class="marker-ring"></div>
        <div class="marker-label">${name}</div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12]
  });
};

export default function RealMapView({ center, zoom, pins, onPinSelect, onMapClick }: Props) {
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof TILE_LAYERS>('dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const activeTile = TILE_LAYERS[selectedStyle];

  return (
    <div className="real-map-wrapper">
      {/* Selector flotante superpuesto de Capas/Estilos de Mapa */}
      <div className="layer-control-box glass-panel">
        <button 
          className="layer-toggle-btn"
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          title="Cambiar estilo de mapa"
        >
          <Layers size={15} />
          <span>{activeTile.name}</span>
        </button>

        {showLayerMenu && (
          <div className="layer-menu">
            {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((key) => (
              <button
                key={key}
                className={`layer-option ${selectedStyle === key ? 'active' : ''}`}
                onClick={() => {
                  setSelectedStyle(key);
                  setShowLayerMenu(false);
                }}
              >
                <span className="layer-indicator" />
                {TILE_LAYERS[key].name}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', background: selectedStyle === 'light' ? '#f8fafc' : '#0f172a' }}
        zoomControl={true}
      >
        <TileLayer
          key={selectedStyle} // Forzar recarga limpia al cambiar de proveedor
          attribution={activeTile.attribution}
          url={activeTile.url}
        />

        {/* Controladores programáticos */}
        <MapController center={center} zoom={zoom} />
        <ClickCapturer onMapClick={onMapClick} />

        {/* Representación nativa de todos los pines pasados desde SQLite */}
        {pins.map((pin) => {
          // Extraer Latitud (pos_y) y Longitud (pos_x)
          const lat = pin.pos_y;
          const lng = pin.pos_x;
          if (lat === undefined || lng === undefined || lat === null || lng === null) return null;

          const pinColor = pin.color || (pin.status === 'visited' ? '#10b981' : '#8b5cf6');
          const icon = createCustomDivIcon(pinColor, pin.city_name, pin.status);

          return (
            <Marker 
              key={pin.id} 
              position={[lat, lng]} 
              icon={icon}
              eventHandlers={{
                click: () => onPinSelect(pin)
              }}
            >
              <Popup className="premium-leaflet-popup">
                <div className="popup-content-inner">
                  <div className="popup-header" style={{ borderLeftColor: pinColor }}>
                    <h4>{pin.city_name}</h4>
                    <span className={`popup-badge ${pin.status}`}>
                      {pin.status === 'visited' ? '✓ Visitado' : '♥ Deseado'}
                    </span>
                  </div>
                  {pin.notes && <p className="popup-notes">{pin.notes}</p>}
                  <button 
                    className="popup-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinSelect(pin);
                    }}
                  >
                    Editar Marcador
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Estilos inyectados nativos para marcadores y popups de Leaflet */}
      <style jsx global>{`
        .real-map-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 450px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* Selector de Capas Flotante */
        .layer-control-box {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 1000;
          border-radius: 8px;
          padding: 4px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .layer-toggle-btn {
          background: transparent;
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .layer-toggle-btn:hover { background: rgba(255,255,255,0.1); }

        .layer-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 160px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.8);
        }

        .layer-option {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          padding: 6px 10px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .layer-option:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .layer-option.active { color: #1dd1a1; background: rgba(29, 209, 161, 0.1); }

        .layer-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Estilos de los Marcadores HTML Personalizados Leaflet */
        .custom-leaflet-marker {
          background: none;
          border: none;
        }

        .marker-wrapper {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .marker-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--marker-color);
          box-shadow: 0 0 10px var(--marker-color), 0 2px 4px rgba(0,0,0,0.8);
          border: 2px solid #fff;
          z-index: 2;
          transition: transform 0.2s;
        }
        .marker-wrapper:hover .marker-dot { transform: scale(1.3); }

        .marker-ring {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1.5px solid var(--marker-color);
          opacity: 0.8;
          animation: leafletPulse 2.5s ease-out infinite;
          pointer-events: none;
        }

        @keyframes leafletPulse {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .marker-label {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 0 2px #000;
          pointer-events: none;
          transition: font-size 0.2s, color 0.2s;
        }
        .marker-wrapper:hover .marker-label { font-size: 12px; color: #1dd1a1; }

        /* Estilizado Premium de Popups Leaflet */
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          color: #fff !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.8) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95) !important; }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }

        .popup-content-inner {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 160px;
        }

        .popup-header {
          border-left-width: 3px;
          border-left-style: solid;
          padding-left: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .popup-header h4 { font-size: 0.95rem; font-weight: 800; margin: 0; }
        
        .popup-badge { font-size: 0.65rem; font-weight: 700; width: fit-content; }
        .popup-badge.visited { color: #10b981; }
        .popup-badge.want_to_go { color: #a855f7; }

        .popup-notes {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin: 0;
          background: rgba(0,0,0,0.25);
          padding: 6px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.02);
          max-height: 80px;
          overflow-y: auto;
        }

        .popup-action-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #1dd1a1;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .popup-action-btn:hover { background: rgba(29, 209, 161, 0.15); color: #fff; }

        /* Esconder enlaces Leaflet en dark theme para una estética ultra limpia */
        .leaflet-control-attribution a { color: #64748b !important; }
        .leaflet-bar a { background-color: rgba(15, 23, 42, 0.9) !important; color: #fff !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-bar a:hover { background-color: rgba(30, 41, 59, 0.9) !important; }
      `}</style>
    </div>
  );
}
