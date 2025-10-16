import fs from 'fs';
import path from 'path';

const INDEX_PATH = path.resolve('./data/index.json');
const DOCS_PATH = path.resolve('./data/docs.json');

let searchIndex = null;
let docs = {};

function loadIndex() {
  if (searchIndex) return searchIndex;
  if (!fs.existsSync(INDEX_PATH)) return null;
  
  const raw = fs.readFileSync(INDEX_PATH, 'utf8');
  searchIndex = JSON.parse(raw);
  
  if (fs.existsSync(DOCS_PATH)) {
    docs = JSON.parse(fs.readFileSync(DOCS_PATH, 'utf8'));
  }
  
  return searchIndex;
}

function simpleSearch(query, index) {
  const words = query.toLowerCase().split(/\W+/).filter(word => word.length > 2);
  const scores = {};
  
  words.forEach(word => {
    if (index.wordMap[word]) {
      index.wordMap[word].forEach(docId => {
        scores[docId] = (scores[docId] || 0) + 1;
      });
    }
  });
  
  return Object.entries(scores)
    .map(([docId, score]) => ({ ref: docId, score: score / words.length }))
    .sort((a, b) => b.score - a.score);
}

export async function searchQuery(req, res) {
  const { q } = req.body;
  if (!q) return res.status(400).json({ error: 'Missing query parameter `q` in body' });

  const idx = loadIndex();
  if (!idx) return res.status(500).json({ error: 'Search index not built. Run `npm run build-index`' });

  const results = simpleSearch(q, idx);
  const out = results.map(r => {
    const doc = docs[r.ref] || {};
    return {
      id: r.ref,
      score: r.score,
      title: doc.title || '',
      snippet: doc.content ? doc.content.slice(0, 300) : ''
    };
  });

  res.json({ query: q, hits: out });
}

export async function searchDocument(req, res) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'Missing id in params' });
  if (!fs.existsSync(DOCS_PATH)) return res.status(500).json({ error: 'No documents found' });
  if (!Object.keys(docs).length) loadIndex();
  const doc = docs[id];
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json({ id, ...doc });
}

export async function cacheQuery(req, res) {
  const { query, results } = req.body;
  if (!query || !results) return res.status(400).json({ error: 'Missing query or results' });
  
  try {
    // Create a new document from the cached query
    const newDoc = {
      id: `cached_${Date.now()}`,
      title: `Cached: ${query}`,
      content: Array.isArray(results) ? results.join(' ') : JSON.stringify(results),
      cached: true,
      timestamp: new Date().toISOString()
    };
    
    // Add to docs directory
    const docPath = path.resolve(`./data/docs/cached_${Date.now()}.json`);
    fs.writeFileSync(docPath, JSON.stringify(newDoc, null, 2));
    
    res.json({ success: true, docId: newDoc.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cache query' });
  }
}
