import { TileLayer } from 'react-leaflet';
import { offlineMapManager } from '../utils/offlineMapManager';
import L from 'leaflet';

// Custom offline tile layer class
class OfflineTileLayer extends L.TileLayer {
  constructor(url, options) {
    super(url, options);
    this.offlineManager = offlineMapManager;
  }

  // Override createTile to check cache first
  createTile(coords, done) {
    const tile = document.createElement('img');
    
    // Set up error handling
    L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

    // Set crossOrigin attribute if needed
    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    // Set alt attribute
    tile.alt = '';

    // Set src attribute - this will trigger load/error events
    this._loadTile(tile, coords);

    return tile;
  }

  // Load tile from cache or network
  async _loadTile(tile, coords) {
    const { x, y, z } = coords;
    const source = this.options.source || 'osm';

    try {
      // First try to get from cache
      const cachedTile = await this.offlineManager.getTile(z, x, y, source);
      
      if (cachedTile && cachedTile.data) {
        // Use cached tile
        tile.src = cachedTile.data;
        return;
      }
      
      // If not in cache, load from network
      const url = this.getTileUrl(coords);
      tile.src = url;
      
      // Download and cache the tile in the background
      this.offlineManager.downloadTile(z, x, y, source).catch(console.error);
      
    } catch (error) {
      console.error('Error loading tile:', error);
      // Fallback to network
      const url = this.getTileUrl(coords);
      tile.src = url;
    }
  }
}

// React component wrapper for offline tile layer
export const OfflineMapTileLayer = ({ url, ...props }) => {
  return <TileLayer {...props} url={url} />;
};