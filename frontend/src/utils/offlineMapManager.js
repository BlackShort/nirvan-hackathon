import localforage from 'localforage';

// Configure localforage for tile storage
const tileStorage = localforage.createInstance({
  name: 'OfflineMapTiles',
  storeName: 'tiles'
});

// Map tile sources (we'll use OpenStreetMap for free offline maps)
export const MAP_SOURCES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    maxZoom: 17
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 15
  }
};

// Default locations for quick access
export const DEFAULT_LOCATIONS = [
  {
    name: 'New York City',
    coords: [40.7128, -74.0060],
    zoom: 12,
    description: 'Major metropolitan area'
  },
  {
    name: 'London',
    coords: [51.5074, -0.1278],
    zoom: 12,
    description: 'UK capital city'
  },
  {
    name: 'Tokyo',
    coords: [35.6762, 139.6503],
    zoom: 12,
    description: 'Japan capital city'
  },
  {
    name: 'Mumbai',
    coords: [19.0760, 72.8777],
    zoom: 12,
    description: 'Financial capital of India'
  },
  {
    name: 'Delhi',
    coords: [28.6139, 77.2090],
    zoom: 12,
    description: 'Capital of India'
  }
];

// Tile download and caching functions
export class OfflineMapManager {
  constructor() {
    this.downloadQueue = [];
    this.isDownloading = false;
    this.downloadProgress = { downloaded: 0, total: 0 };
    this.onProgressUpdate = null;
  }

  // Generate tile key for storage
  getTileKey(z, x, y, source = 'osm') {
    return `${source}_${z}_${x}_${y}`;
  }

  // Get tile URL
  getTileUrl(z, x, y, source = 'osm') {
    const mapSource = MAP_SOURCES[source];
    if (!mapSource) return null;

    return mapSource.url
      .replace('{z}', z)
      .replace('{x}', x)
      .replace('{y}', y)
      .replace('{s}', ['a', 'b', 'c'][Math.floor(Math.random() * 3)]);
  }

  // Check if tile exists in cache
  async hasTile(z, x, y, source = 'osm') {
    try {
      const key = this.getTileKey(z, x, y, source);
      const tile = await tileStorage.getItem(key);
      return !!tile;
    } catch (error) {
      console.error('Error checking tile cache:', error);
      return false;
    }
  }

  // Get tile from cache
  async getTile(z, x, y, source = 'osm') {
    try {
      const key = this.getTileKey(z, x, y, source);
      return await tileStorage.getItem(key);
    } catch (error) {
      console.error('Error getting cached tile:', error);
      return null;
    }
  }

  // Download and cache a single tile
  async downloadTile(z, x, y, source = 'osm') {
    try {
      const url = this.getTileUrl(z, x, y, source);
      if (!url) throw new Error('Invalid tile URL');

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      
      const key = this.getTileKey(z, x, y, source);
      await tileStorage.setItem(key, {
        data: base64,
        timestamp: Date.now(),
        source,
        z, x, y
      });

      return true;
    } catch (error) {
      console.error(`Error downloading tile ${z}/${x}/${y}:`, error);
      return false;
    }
  }

  // Convert blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Calculate tile bounds for a given area
  getTileBounds(lat, lng, zoom, radius = 0.01) {
    const minLat = lat - radius;
    const maxLat = lat + radius;
    const minLng = lng - radius;
    const maxLng = lng + radius;

    const minTileX = Math.floor((minLng + 180) / 360 * Math.pow(2, zoom));
    const maxTileX = Math.floor((maxLng + 180) / 360 * Math.pow(2, zoom));
    const minTileY = Math.floor((1 - Math.log(Math.tan(maxLat * Math.PI / 180) + 1 / Math.cos(maxLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    const maxTileY = Math.floor((1 - Math.log(Math.tan(minLat * Math.PI / 180) + 1 / Math.cos(minLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

    return { minTileX, maxTileX, minTileY, maxTileY };
  }

  // Download tiles for a specific area
  async downloadArea(lat, lng, minZoom = 10, maxZoom = 15, source = 'osm', radius = 0.01) {
    const tiles = [];
    
    for (let z = minZoom; z <= maxZoom; z++) {
      const bounds = this.getTileBounds(lat, lng, z, radius);
      
      for (let x = bounds.minTileX; x <= bounds.maxTileX; x++) {
        for (let y = bounds.minTileY; y <= bounds.maxTileY; y++) {
          tiles.push({ z, x, y, source });
        }
      }
    }

    this.downloadQueue = tiles;
    this.downloadProgress = { downloaded: 0, total: tiles.length };
    
    await this.processDownloadQueue();
    return this.downloadProgress;
  }

  // Process download queue
  async processDownloadQueue() {
    this.isDownloading = true;
    
    for (const tile of this.downloadQueue) {
      const { z, x, y, source } = tile;
      
      // Check if tile already exists
      const exists = await this.hasTile(z, x, y, source);
      if (!exists) {
        await this.downloadTile(z, x, y, source);
      }
      
      this.downloadProgress.downloaded++;
      
      if (this.onProgressUpdate) {
        this.onProgressUpdate(this.downloadProgress);
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isDownloading = false;
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const keys = await tileStorage.keys();
      const stats = {
        totalTiles: keys.length,
        sources: {},
        totalSize: 0
      };

      for (const key of keys) {
        const tile = await tileStorage.getItem(key);
        if (tile) {
          const source = tile.source || 'unknown';
          stats.sources[source] = (stats.sources[source] || 0) + 1;
          stats.totalSize += tile.data ? tile.data.length : 0;
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalTiles: 0, sources: {}, totalSize: 0 };
    }
  }

  // Clear cache
  async clearCache(source = null) {
    try {
      if (source) {
        const keys = await tileStorage.keys();
        const keysToDelete = keys.filter(key => key.startsWith(`${source}_`));
        
        for (const key of keysToDelete) {
          await tileStorage.removeItem(key);
        }
        
        return keysToDelete.length;
      } else {
        await tileStorage.clear();
        return 'all';
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      return 0;
    }
  }

  // Set progress callback
  onProgress(callback) {
    this.onProgressUpdate = callback;
  }
}

// Create singleton instance
export const offlineMapManager = new OfflineMapManager();