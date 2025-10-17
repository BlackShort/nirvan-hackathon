import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { offlineMapManager, MAP_SOURCES, DEFAULT_LOCATIONS } from '../utils/offlineMapManager';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and updates
const MapEventHandler = ({ onLocationSelect, setMarkers }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
      
      // Add marker at clicked location
      const newMarker = {
        id: Date.now(),
        position: [lat, lng],
        popup: `Custom Location\nLat: ${lat.toFixed(6)}\nLng: ${lng.toFixed(6)}`
      };
      
      setMarkers(prev => [...prev, newMarker]);
    }
  });

  return null;
};

export const OfflineMaps = () => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATIONS[0]);
  const [mapSource, setMapSource] = useState('osm');
  const [markers, setMarkers] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cacheStats, setCacheStats] = useState({ totalTiles: 0, sources: {}, totalSize: 0 });
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const mapRef = useRef();

  // Initialize offline map manager
  useEffect(() => {
    offlineMapManager.onProgress((progress) => {
      setDownloadProgress(progress);
      if (progress.downloaded >= progress.total) {
        setIsDownloading(false);
        updateCacheStats();
      }
    });

    updateCacheStats();
    getUserLocation();
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkers(prev => [...prev, {
            id: 'user-location',
            position: [latitude, longitude],
            popup: 'Your Current Location',
            color: 'blue'
          }]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  // Update cache statistics
  const updateCacheStats = async () => {
    const stats = await offlineMapManager.getCacheStats();
    setCacheStats(stats);
  };

  // Handle location selection from dropdown
  const handleLocationChange = (location) => {
    setCurrentLocation(location);
    setMarkers(prev => {
      const filtered = prev.filter(m => m.id !== 'selected-location');
      return [...filtered, {
        id: 'selected-location',
        position: location.coords,
        popup: `${location.name}\n${location.description}`,
        color: 'green'
      }];
    });
  };

  // Download tiles for current area
  const downloadCurrentArea = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    setDownloadProgress({ downloaded: 0, total: 0 });
    
    try {
      const [lat, lng] = currentLocation.coords;
      await offlineMapManager.downloadArea(lat, lng, 10, 15, mapSource, 0.02);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  // Clear cache
  const clearCache = async (source = null) => {
    const result = await offlineMapManager.clearCache(source);
    console.log('Cleared cache:', result);
    updateCacheStats();
    setMarkers([]);
  };

  // Handle custom location selection
  const handleLocationSelect = (lat, lng) => {
    console.log('Selected location:', lat, lng);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!downloadProgress || downloadProgress.total === 0) return 0;
    return Math.round((downloadProgress.downloaded / downloadProgress.total) * 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Offline Maps
          </h2>
          <p className="text-gray-600 mt-1">Browse and download maps for offline use</p>
        </div>
        
        <button
          onClick={() => setShowDownloadPanel(!showDownloadPanel)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showDownloadPanel ? 'Hide Panel' : 'Download Panel'}
        </button>
      </div>

      {/* Controls Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location
            </label>
            <select
              value={currentLocation.name}
              onChange={(e) => {
                const location = DEFAULT_LOCATIONS.find(loc => loc.name === e.target.value);
                if (location) handleLocationChange(location);
              }}
              className="text-gray-700  w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DEFAULT_LOCATIONS.map((location) => (
                <option key={location.name} value={location.name} className="text-gray-800">
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {/* Map Source Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Style
            </label>
            <select
              value={mapSource}
              onChange={(e) => setMapSource(e.target.value)}
              className="text-gray-700 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(MAP_SOURCES).map(([key, source]) => (
                <option key={key} value={key} className='text-gray-700 '>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <div className="flex space-x-2">
              <button
                onClick={downloadCurrentArea}
                disabled={isDownloading}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isDownloading ? 'Downloading...' : 'Download Area'}
              </button>
              
              <button
                onClick={getUserLocation}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                📍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Download Panel */}
      {showDownloadPanel && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Download & Cache Management</h3>
          
          {/* Download Progress */}
          {isDownloading && downloadProgress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Download Progress</span>
                <span className="text-sm font-medium">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {downloadProgress.downloaded} / {downloadProgress.total} tiles
              </p>
            </div>
          )}

          {/* Cache Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700">Total Tiles</h4>
              <p className="text-2xl font-bold text-blue-600">{cacheStats.totalTiles}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700">Cache Size</h4>
              <p className="text-2xl font-bold text-green-600">{formatSize(cacheStats.totalSize)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700">Map Sources</h4>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(cacheStats.sources).length}</p>
            </div>
          </div>

          {/* Cache Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => clearCache()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All Cache
            </button>
            
            {Object.keys(cacheStats.sources).map((source) => (
              <button
                key={source}
                onClick={() => clearCache(source)}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Clear {MAP_SOURCES[source]?.name || source} ({cacheStats.sources[source]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            ref={mapRef}
            center={currentLocation.coords}
            zoom={currentLocation.zoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url={MAP_SOURCES[mapSource].url}
              attribution={MAP_SOURCES[mapSource].attribution}
              maxZoom={MAP_SOURCES[mapSource].maxZoom}
            />
            
            <MapEventHandler 
              onLocationSelect={handleLocationSelect}
              setMarkers={setMarkers}
            />
            
            {/* Render all markers */}
            {markers.map((marker) => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="text-sm">
                    {marker.popup.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};