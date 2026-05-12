'use client';

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Compass, MapPin, Plus, Trash2, CheckCircle, 
  Search, Sparkles, Heart, Check, Globe, Loader2, Map
} from 'lucide-react';
import { 
  TravelPin, 
  saveTravelPin, 
  deleteTravelPin, 
  toggleTravelPinStatus 
} from '@/app/(dashboard)/lifestyle/viajes/actions';

// Importar el mapa real Leaflet dinámicamente deshabilitando SSR para evitar errores en el servidor
const RealMapView = dynamic(() => import('./RealMapView'), { 
  ssr: false,
  loading: () => (
    <div className="map-loading-state glass-panel">
      <Loader2 className="spinning-fast" size={32} />
      <span>Inicializando motor de mapas reales GIS...</span>
    </div>
  )
});

interface Props {
  initialPins: TravelPin[];
}

interface Suggestion {
  name: string;
  context: string;
  lat: number;
  lng: number;
}

// Coordenadas GPS reales [latitud, longitud] de referencia
const PREDEFINED_FRANCE = [
  { name: 'París', lat: 48.8566, lng: 2.3522 },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  { name: 'Marsella', lat: 43.2965, lng: 5.3698 },
  { name: 'Niza', lat: 43.7102, lng: 7.2620 },
  { name: 'Burdeos', lat: 44.8378, lng: -0.5792 },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { name: 'Estrasburgo', lat: 48.5734, lng: 7.7521 },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { name: 'Lille', lat: 50.6292, lng: 3.0573 },
  { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  { name: 'Ajaccio (Córcega)', lat: 41.9267, lng: 8.7369 },
];

const PREDEFINED_EUROPE_MOROCCO = [
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'París', lat: 48.8566, lng: 2.3522 },
  { name: 'Londres', lat: 51.5074, lng: -0.1278 },
  { name: 'Roma', lat: 41.9028, lng: 12.4964 },
  { name: 'Berlín', lat: 52.5200, lng: 13.4050 },
  { name: 'Ámsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Praga', lat: 50.0755, lng: 14.4378 },
  { name: 'Viena', lat: 48.2082, lng: 16.3738 },
  { name: 'Lisboa', lat: 38.7223, lng: -9.1393 },
  { name: 'Bruselas', lat: 50.8503, lng: 4.3517 },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
  { name: 'Tánger', lat: 35.7595, lng: -5.8340 },
  { name: 'Fez', lat: 34.0372, lng: -4.9998 },
];

export default function ViajesDashboard({ initialPins }: Props) {
  const [pins, setPins] = useState<TravelPin[]>(initialPins);
  const [activeTab, setActiveTab] = useState<'francia' | 'europa'>('francia');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visited' | 'want_to_go'>('all');
  const [isPending, startTransition] = useTransition();

  // Estado del centro y zoom del mapa Leaflet
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334]); // Centro de Francia inicial
  const [mapZoom, setMapZoom] = useState<number>(6);

  // Estado de Búsqueda y Autocompletado en vivo (GeoAPI / Nominatim)
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estado del Formulario de Marcación (Pines)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [formCity, setFormCity] = useState('');
  const [formStatus, setFormStatus] = useState<'visited' | 'want_to_go'>('visited');
  const [formColor, setFormColor] = useState('#10b981');
  const [formNotes, setFormNotes] = useState('');
  const [formLat, setFormLat] = useState<number>(48.8566);
  const [formLng, setFormLng] = useState<number>(2.3522);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Obtener los pines filtrados correspondientes al mapa actual
  const currentMapPins = pins.filter(p => p.map_id === activeTab);
  
  const displayedPins = currentMapPins.filter(p => {
    return filterStatus === 'all' || p.status === filterStatus;
  });

  // Estadísticas rápidas
  const visitedCount = currentMapPins.filter(p => p.status === 'visited').length;
  const wantToGoCount = currentMapPins.filter(p => p.status === 'want_to_go').length;

  // Cambiar pestaña actualizando la vista central del mapa
  const handleTabChange = (tab: 'francia' | 'europa') => {
    setActiveTab(tab);
    setIsFormOpen(false);
    setSelectedPinId(null);
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);

    if (tab === 'francia') {
      setMapCenter([46.603354, 1.888334]);
      setMapZoom(6);
    } else {
      setMapCenter([42.0, 5.0]);
      setMapZoom(4);
    }
  };

  // Función asíncrona de consulta de APIs (con debounce manual)
  const fetchApiSuggestions = useCallback(async (query: string, tab: 'francia' | 'europa') => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      if (tab === 'francia') {
        // GeoAPI del Gobierno Francés: Retorna todos los municipios oficiales de Francia al instante
        const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,departement,region&boost=population&limit=6`);
        if (!res.ok) throw new Error("GeoAPI error");
        const data = await res.json();
        
        const results: Suggestion[] = data.map((item: any) => ({
          name: item.nom,
          context: `${item.departement?.nom || ''} (${item.codesPostaux?.[0] || ''})`,
          lng: item.centre?.coordinates?.[0] || 0,
          lat: item.centre?.coordinates?.[1] || 0
        })).filter((s: Suggestion) => s.lat !== 0 && s.lng !== 0);

        setSuggestions(results);
      } else {
        // Nominatim OpenStreetMap API para Europa y Marruecos
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6`, {
          headers: { 'Accept-Language': 'es' }
        });
        if (!res.ok) throw new Error("Nominatim error");
        const data = await res.json();
        
        const results: Suggestion[] = data.map((item: any) => ({
          name: item.display_name.split(',')[0],
          context: item.display_name.split(',').slice(1, 3).join(',').trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));

        setSuggestions(results);
      }
    } catch (err) {
      console.error("Error consultando APIs de geocodificación:", err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejador del input de búsqueda
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      fetchApiSuggestions(value, activeTab);
    }, 350); // Debounce suave para no saturar peticiones
  };

  // Abrir formulario con datos específicos
  const handleOpenForm = (cityName: string, lat: number, lng: number, existingPin?: TravelPin) => {
    if (existingPin) {
      setSelectedPinId(existingPin.id);
      setFormCity(existingPin.city_name);
      setFormStatus(existingPin.status);
      setFormColor(existingPin.color || (existingPin.status === 'visited' ? '#10b981' : '#8b5cf6'));
      setFormNotes(existingPin.notes || '');
      setFormLat(existingPin.pos_y || lat);
      setFormLng(existingPin.pos_x || lng);
    } else {
      setSelectedPinId(null);
      setFormCity(cityName);
      setFormStatus('visited');
      setFormColor('#10b981');
      setFormNotes('');
      setFormLat(lat);
      setFormLng(lng);
    }
    setIsFormOpen(true);
  };

  // Seleccionar una sugerencia del autocompletado API
  const handleSelectSuggestion = (s: Suggestion) => {
    setSearchQuery(s.name);
    setShowDropdown(false);
    
    // Volar de inmediato al lugar real
    setMapCenter([s.lat, s.lng]);
    setMapZoom(12);

    // Revisar si ya lo tenemos guardado
    const existing = currentMapPins.find(p => p.city_name.toLowerCase() === s.name.toLowerCase());
    handleOpenForm(s.name, s.lat, s.lng, existing);
  };

  // Sincronizar color predeterminado al cambiar de estado
  const handleStatusChange = (status: 'visited' | 'want_to_go') => {
    setFormStatus(status);
    if (status === 'visited') setFormColor('#10b981');
    else setFormColor('#8b5cf6');
  };

  // Guardar Pin en base de datos
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCity.trim()) return;

    const pinData = {
      id: selectedPinId || undefined,
      mapId: activeTab,
      cityName: formCity.trim(),
      status: formStatus,
      color: formColor,
      notes: formNotes.trim(),
      posX: formLng, // En SQLite: pos_x es la Longitud
      posY: formLat  // En SQLite: pos_y es la Latitud
    };

    const newId = selectedPinId || crypto.randomUUID();
    const now = new Date().toISOString();
    
    setPins(prev => {
      const exists = prev.find(p => p.id === newId || (p.map_id === activeTab && p.city_name.toLowerCase() === formCity.trim().toLowerCase()));
      if (exists) {
        return prev.map(p => p.id === exists.id ? { ...p, ...pinData, id: exists.id } : p);
      } else {
        return [{ 
          ...pinData, 
          id: newId, 
          map_id: activeTab,
          city_name: pinData.cityName,
          pos_x: formLng,
          pos_y: formLat,
          created_at: now 
        }, ...prev];
      }
    });

    setIsFormOpen(false);
    setSelectedPinId(null);

    // Guardado persistente
    startTransition(async () => {
      await saveTravelPin(pinData);
    });
  };

  // Eliminar Pin
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPins(prev => prev.filter(p => p.id !== id));
    if (selectedPinId === id) setIsFormOpen(false);

    startTransition(async () => {
      await deleteTravelPin(id);
    });
  };

  // Alternar Estado
  const handleToggleStatus = (id: string, currentStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = currentStatus === 'visited' ? 'want_to_go' : 'visited';
    const defaultColor = newStatus === 'visited' ? '#10b981' : '#8b5cf6';

    setPins(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any, color: defaultColor } : p));
    
    startTransition(async () => {
      await toggleTravelPinStatus(id, currentStatus);
    });
  };

  const predefinedList = activeTab === 'francia' ? PREDEFINED_FRANCE : PREDEFINED_EUROPE_MOROCCO;

  return (
    <div className="viajes-container">
      {/* Encabezado Principal */}
      <header className="dashboard-header">
        <div className="header-title-area">
          <div className="title-wrapper">
            <Map className="header-icon spinning-slow" size={36} />
            <div>
              <h1 className="page-title">Mapas Reales GIS & Autocompletado</h1>
              <p className="page-subtitle">
                {activeTab === 'francia' 
                  ? 'Conectado a la GeoAPI oficial de Francia: Encuentra al instante cualquier municipio.' 
                  : 'Búsqueda geográfica en vivo mediante OpenStreetMap.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bloques de Estadísticas Premium */}
        <div className="stats-row">
          <div className="glass-panel stat-card">
            <span className="stat-label">Total Destinos</span>
            <span className="stat-value">{currentMapPins.length}</span>
            <div className="stat-glow glow-blue" />
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-label">Lugares Visitados</span>
            <span className="stat-value text-emerald">{visitedCount}</span>
            <div className="stat-glow glow-emerald" />
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-label">Destinos Deseados</span>
            <span className="stat-value text-purple">{wantToGoCount}</span>
            <div className="stat-glow glow-purple" />
          </div>
        </div>
      </header>

      {/* Pestañas y Buscador Principal */}
      <div className="tabs-wrapper">
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'francia' ? 'active' : ''}`}
            onClick={() => handleTabChange('francia')}
          >
            <span className="tab-flag">🇫🇷</span>
            <span className="tab-text">Francia Real (GeoAPI)</span>
            {activeTab === 'francia' && <motion.div layoutId="activeTabIndicator" className="tab-indicator" />}
          </button>
          <button 
            className={`tab-button ${activeTab === 'europa' ? 'active' : ''}`}
            onClick={() => handleTabChange('europa')}
          >
            <span className="tab-flag">🌍</span>
            <span className="tab-text">Europa & Marruecos</span>
            {activeTab === 'europa' && <motion.div layoutId="activeTabIndicator" className="tab-indicator" />}
          </button>
        </div>

        {/* Barra de Búsqueda Conectada a la API */}
        <div className="controls-group">
          <div className="search-box-api">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder={activeTab === 'francia' ? 'Escribe un municipio de Francia...' : 'Buscar ciudad...'}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => setShowDropdown(true)}
              className="search-input-api"
            />
            {isSearching && <Loader2 size={14} className="search-loader spinning-fast" />}

            {/* Menú Desplegable Flotante de Resultados API */}
            <AnimatePresence>
              {showDropdown && searchQuery.trim().length >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="suggestions-dropdown glass-panel"
                >
                  <div className="dropdown-title">
                    <span>Resultados en vivo API:</span>
                    <button className="close-dropdown" onClick={() => setShowDropdown(false)}>×</button>
                  </div>

                  {isSearching && suggestions.length === 0 ? (
                    <div className="dropdown-item-loading">Consultando coordenadas oficiales...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="dropdown-item-empty">No se encontraron municipios coincidentes.</div>
                  ) : (
                    suggestions.map((s, idx) => {
                      const isSaved = currentMapPins.some(p => p.city_name.toLowerCase() === s.name.toLowerCase());
                      return (
                        <div 
                          key={idx} 
                          className={`suggestion-item ${isSaved ? 'saved' : ''}`}
                          onClick={() => handleSelectSuggestion(s)}
                        >
                          <div className="sug-info">
                            <span className="sug-name">{s.name}</span>
                            {s.context && <span className="sug-context">{s.context}</span>}
                          </div>
                          <button className="sug-action-btn">
                            {isSaved ? 'Ver Pin' : '+ Marcar'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filtros por estado */}
          <div className="filter-group">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Todos
            </button>
            <button 
              className={`filter-btn visited ${filterStatus === 'visited' ? 'active' : ''}`}
              onClick={() => setFilterStatus('visited')}
            >
              <Check size={12} /> Visitados
            </button>
            <button 
              className={`filter-btn want ${filterStatus === 'want_to_go' ? 'active' : ''}`}
              onClick={() => setFilterStatus('want_to_go')}
            >
              <Heart size={12} /> Deseados
            </button>
          </div>
        </div>
      </div>

      {/* Espacio Central de Trabajo */}
      <div className="map-workspace">
        {/* Contenedor del Mapa Real (Leaflet) */}
        <div className="map-card glass-panel">
          <div className="map-instructions">
            <Sparkles size={14} className="instruction-icon" />
            <span>
              <strong>Búsqueda directa:</strong> Teclea arriba el municipio para anclar automáticamente. También puedes hacer clic sobre cualquier coordenada del mapa.
            </span>
          </div>

          <div className="real-map-container">
            <RealMapView 
              center={mapCenter}
              zoom={mapZoom}
              pins={displayedPins}
              onPinSelect={(pin) => {
                if (pin.pos_y !== undefined && pin.pos_x !== undefined) {
                  setMapCenter([pin.pos_y, pin.pos_x]);
                  handleOpenForm(pin.city_name, pin.pos_y, pin.pos_x, pin);
                }
              }}
              onMapClick={(lat, lng) => {
                // Volar y abrir formulario libre
                setMapCenter([lat, lng]);
                handleOpenForm('Punto Personalizado', lat, lng);
              }}
            />
          </div>

          {/* Selector Rápido Inferior de Ciudades */}
          <div className="quick-cities-tray">
            <span className="tray-label">Centros de un clic:</span>
            <div className="tray-scroll">
              {predefinedList.map(city => {
                const isSaved = currentMapPins.some(p => p.city_name.toLowerCase() === city.name.toLowerCase());
                return (
                  <button
                    key={city.name}
                    className={`city-pill ${isSaved ? 'saved' : ''}`}
                    onClick={() => {
                      setMapCenter([city.lat, city.lng]);
                      setMapZoom(11);
                      const pin = currentMapPins.find(p => p.city_name.toLowerCase() === city.name.toLowerCase());
                      handleOpenForm(city.name, city.lat, city.lng, pin);
                    }}
                  >
                    <MapPin size={12} /> {city.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Lateral de Formulario y Registros */}
        <div className="side-panel-area">
          <AnimatePresence mode="wait">
            {isFormOpen ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel form-panel"
              >
                <div className="form-header">
                  <h3>{selectedPinId ? 'Editar Marcador Real' : 'Fijar Destino GPS'}</h3>
                  <button className="close-btn" onClick={() => setIsFormOpen(false)}>×</button>
                </div>

                <form onSubmit={handleSave} className="pin-form">
                  <div className="form-group">
                    <label>Municipio / Nombre Oficial</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. París, Burdeos, Estrasburgo..." 
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado de Exploración</label>
                    <div className="status-selector">
                      <button 
                        type="button"
                        className={`status-opt visited ${formStatus === 'visited' ? 'selected' : ''}`}
                        onClick={() => handleStatusChange('visited')}
                      >
                        <CheckCircle size={16} />
                        <div>
                          <strong>Lugares donde he ido</strong>
                          <span>Territorio visitado</span>
                        </div>
                      </button>

                      <button 
                        type="button"
                        className={`status-opt want ${formStatus === 'want_to_go' ? 'selected' : ''}`}
                        onClick={() => handleStatusChange('want_to_go')}
                      >
                        <Heart size={16} />
                        <div>
                          <strong>A donde me gustaría ir</strong>
                          <span>Próximo destino</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="form-row-split">
                    <div className="form-group">
                      <label>Color del Pin</label>
                      <div className="color-input-wrapper">
                        <input 
                          type="color" 
                          value={formColor} 
                          onChange={(e) => setFormColor(e.target.value)}
                          className="color-picker"
                        />
                        <span className="color-hex">{formColor}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Coordenadas (GPS)</label>
                      <div className="coord-info-gps">
                        <span>Lat: {formLat.toFixed(4)}</span>
                        <span>Lng: {formLng.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notas del Viaje</label>
                    <textarea 
                      placeholder="Escribe memorias, itinerarios o recomendaciones..." 
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    {selectedPinId && (
                      <button 
                        type="button" 
                        className="btn-delete-full"
                        onClick={() => handleDelete(selectedPinId)}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    )}
                    <button type="submit" className="btn-save-full">
                      {selectedPinId ? 'Actualizar Pin' : 'Anclar en Mapa Real'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Lista de Registros */
              <div className="saved-destinations-panel">
                <div className="list-header">
                  <h3>Registro de Marcadores ({displayedPins.length})</h3>
                  <button 
                    className="btn-add-custom"
                    onClick={() => {
                      setMapCenter([48.8566, 2.3522]);
                      handleOpenForm('París', 48.8566, 2.3522);
                    }}
                  >
                    <Plus size={14} /> Pin Manual
                  </button>
                </div>

                <div className="pins-scroll-list">
                  {displayedPins.length === 0 ? (
                    <div className="empty-pins">
                      <MapPin size={32} className="empty-icon" />
                      <p>No tienes marcadores guardados en este mapa.</p>
                      <span>Usa el buscador por API de municipios para empezar al instante.</span>
                    </div>
                  ) : (
                    displayedPins.map(pin => (
                      <motion.div 
                        layout 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={pin.id} 
                        className={`glass-panel pin-card ${pin.status}`}
                        style={{ borderLeftColor: pin.color || (pin.status === 'visited' ? '#10b981' : '#8b5cf6') }}
                        onClick={() => {
                          if (pin.pos_y !== undefined && pin.pos_x !== undefined) {
                            setMapCenter([pin.pos_y, pin.pos_x]);
                            setMapZoom(13);
                            handleOpenForm(pin.city_name, pin.pos_y, pin.pos_x, pin);
                          }
                        }}
                      >
                        <div className="pin-card-top">
                          <div className="pin-card-title">
                            <span 
                              className="pin-color-badge" 
                              style={{ backgroundColor: pin.color || (pin.status === 'visited' ? '#10b981' : '#8b5cf6') }} 
                            />
                            <h4>{pin.city_name}</h4>
                          </div>
                          
                          <div className="pin-card-controls">
                            <button 
                              type="button" 
                              className="btn-status-toggle"
                              title="Alternar Clasificación"
                              onClick={(e) => handleToggleStatus(pin.id, pin.status, e)}
                            >
                              {pin.status === 'visited' ? <CheckCircle size={15} className="text-emerald" /> : <Heart size={15} className="text-purple" />}
                            </button>
                            <button 
                              type="button" 
                              className="btn-del"
                              title="Eliminar Marcador"
                              onClick={(e) => handleDelete(pin.id, e)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>


                        {pin.notes && (
                          <p className="pin-notes">{pin.notes}</p>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Estilizado CSS Premium Global */}
      <style jsx global>{`
        .viajes-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
          color: var(--color-text);
        }

        /* Header */
        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .spinning-slow {
          color: #1dd1a1;
          animation: floatSlow 6s ease-in-out infinite;
        }
        .spinning-fast {
          color: #1dd1a1;
          animation: spinFast 1s linear infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(8deg); }
        }
        @keyframes spinFast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }

        .stat-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          margin-top: 0.2rem;
        }

        .text-emerald { color: #10b981; }
        .text-purple { color: #a855f7; }

        .stat-glow {
          position: absolute;
          right: -20px;
          bottom: -20px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          filter: blur(25px);
          opacity: 0.2;
          pointer-events: none;
        }
        .glow-blue { background: #3b82f6; }
        .glow-emerald { background: #10b981; }
        .glow-purple { background: #a855f7; }

        /* Tabs & Controls */
        .tabs-wrapper {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 0.5rem;
          border-radius: var(--radius-md);
          box-shadow: var(--glass-shadow);
        }

        .tabs-container {
          display: flex;
          gap: 0.5rem;
          position: relative;
        }

        .tab-button {
          background: transparent;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          position: relative;
          transition: color 0.2s;
        }

        .tab-button.active {
          color: #fff;
        }

        .tab-indicator {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: -1;
        }

        .controls-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.8rem;
        }

        /* Contenedor de Búsqueda API */
        .search-box-api {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--color-text-muted);
          z-index: 2;
        }

        .search-loader {
          position: absolute;
          right: 10px;
          color: #1dd1a1;
          z-index: 2;
        }

        .search-input-api {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid var(--glass-border);
          padding: 0.55rem 2rem 0.55rem 2.2rem;
          border-radius: var(--radius-sm);
          color: #fff;
          font-size: 0.85rem;
          width: 250px;
          transition: width 0.3s, border-color 0.2s;
        }
        .search-input-api:focus {
          width: 300px;
          outline: none;
          border-color: #1dd1a1;
          background: rgba(0, 0, 0, 0.5);
        }

        /* Menú Desplegable de Resultados Autocompletado */
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          margin-top: 6px;
          background: rgba(15, 23, 42, 0.96);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(29, 209, 161, 0.3);
          border-radius: var(--radius-sm);
          box-shadow: 0 12px 35px rgba(0,0,0,0.85);
          z-index: 2000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .dropdown-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }
        .close-dropdown {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
        }
        .close-dropdown:hover { color: #fff; }

        .dropdown-item-loading, .dropdown-item-empty {
          padding: 12px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-style: italic;
        }

        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer;
          transition: background 0.2s;
        }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover { background: rgba(29, 209, 161, 0.1); }
        .suggestion-item.saved { border-left: 3px solid #1dd1a1; background: rgba(255,255,255,0.02); }

        .sug-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .sug-name { font-size: 0.85rem; font-weight: 800; color: #fff; }
        .sug-context { font-size: 0.7rem; color: var(--color-text-muted); }

        .sug-action-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #1dd1a1;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          transition: all 0.2s;
        }
        .suggestion-item:hover .sug-action-btn { background: #1dd1a1; color: #000; }

        .filter-group {
          display: flex;
          background: rgba(0, 0, 0, 0.25);
          border-radius: var(--radius-sm);
          padding: 2px;
          border: 1px solid var(--glass-border);
        }

        .filter-btn {
          background: transparent;
          border: none;
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-muted);
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }
        .filter-btn.visited.active { color: #10b981; }
        .filter-btn.want.active { color: #a855f7; }

        /* Workspace Central */
        .map-workspace {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .map-workspace {
            grid-template-columns: 1fr;
          }
        }

        .map-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--glass-shadow);
        }

        .map-instructions {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .instruction-icon {
          color: #1dd1a1;
          flex-shrink: 0;
        }

        .real-map-container {
          width: 100%;
          height: 500px;
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .map-loading-state {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-weight: 700;
          color: var(--color-text-muted);
        }

        /* Tray Inferior */
        .quick-cities-tray {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 1rem;
        }

        .tray-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          font-weight: 700;
        }

        .tray-scroll {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .tray-scroll::-webkit-scrollbar { height: 4px; }
        .tray-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

        .city-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .city-pill:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }
        .city-pill.saved {
          background: rgba(29, 209, 161, 0.12);
          border-color: rgba(29, 209, 161, 0.35);
          color: #1dd1a1;
          font-weight: 700;
        }

        /* Panel Lateral */
        .side-panel-area {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .form-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          border-color: rgba(29, 209, 161, 0.4);
          background: var(--glass-bg);
          box-shadow: var(--glass-shadow);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .form-header h3 { font-size: 1.1rem; margin: 0; font-weight: 800; }
        .close-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #fff; }

        .pin-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input, .form-textarea {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--glass-border);
          padding: 0.65rem 0.8rem;
          border-radius: var(--radius-sm);
          color: #fff;
          font-size: 0.85rem;
          font-family: inherit;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #1dd1a1;
        }

        .status-selector {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .status-opt {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--glass-border);
          padding: 0.65rem 0.8rem;
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          text-align: left;
          transition: all 0.2s;
        }
        .status-opt div {
          display: flex;
          flex-direction: column;
        }
        .status-opt strong { font-size: 0.8rem; color: var(--color-text); font-weight: 700; }
        .status-opt span { font-size: 0.65rem; opacity: 0.7; }

        .status-opt.visited.selected {
          background: rgba(16, 185, 129, 0.12);
          border-color: #10b981;
          color: #10b981;
        }
        .status-opt.want.selected {
          background: rgba(168, 85, 247, 0.12);
          border-color: #a855f7;
          color: #a855f7;
        }

        .form-row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .color-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--glass-border);
        }
        .color-picker {
          background: none;
          border: none;
          width: 26px;
          height: 26px;
          cursor: pointer;
          padding: 0;
        }
        .color-hex { font-size: 0.75rem; font-family: monospace; font-weight: 700; }

        .coord-info-gps {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-family: monospace;
          color: #1dd1a1;
          justify-content: center;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .form-actions {
          display: flex;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .btn-save-full {
          flex: 1;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          border: none;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          transition: opacity 0.2s;
        }
        .btn-save-full:hover { opacity: 0.9; }

        .btn-delete-full {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s;
        }
        .btn-delete-full:hover { background: rgba(239, 68, 68, 0.25); }

        /* Saved List */
        .saved-destinations-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .list-header h3 { font-size: 1rem; margin: 0; font-weight: 800; }

        .btn-add-custom {
          background: rgba(255, 255, 255, 0.05);
          border: 1px dashed var(--glass-border);
          color: var(--color-text-muted);
          padding: 0.35rem 0.7rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .btn-add-custom:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }

        .pins-scroll-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 550px;
          overflow-y: auto;
          padding-right: 6px;
        }
        .pins-scroll-list::-webkit-scrollbar { width: 5px; }
        .pins-scroll-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

        .empty-pins {
          padding: 3.5rem 1rem;
          text-align: center;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          box-shadow: var(--glass-shadow);
        }
        .empty-icon { color: var(--color-text-muted); opacity: 0.4; }
        .empty-pins p { font-size: 0.85rem; font-weight: 800; margin: 0; }
        .empty-pins span { font-size: 0.75rem; color: var(--color-text-muted); }

        .pin-card {
          padding: 1.2rem 1.4rem;
          min-height: 60px;
          border-left-width: 4px;
          border-left-style: solid;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.6rem;
          background: var(--glass-bg);
          border-top: 1px solid var(--glass-border);
          border-right: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 30px;
        }
        .pin-card:hover {
          transform: translateX(4px);
          background: var(--glass-bg-hover);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        .pin-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pin-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pin-color-badge {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
          flex-shrink: 0;
        }
        .pin-card-title h4 { 
          font-size: 1.05rem; 
          margin: 0; 
          font-weight: 800; 
          line-height: 1.4;
          padding-bottom: 2px;
        }

        .pin-card-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-status-toggle, .btn-del {
          background: none;
          border: none;
          padding: 5px;
          cursor: pointer;
          color: var(--color-text-muted);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .btn-status-toggle:hover { background: rgba(255,255,255,0.06); transform: scale(1.1); }
        .btn-del:hover { color: #ef4444; background: rgba(239, 68, 68, 0.12); transform: scale(1.1); }

        .pin-status-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.85;
        }

        .pin-notes {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin: 0;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
