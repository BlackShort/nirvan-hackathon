import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('./data');
const DOCS_DIR = path.resolve('./data/docs');
const INDEX_PATH = path.resolve('./data/index.json');
const DOCS_OUT = path.resolve('./data/docs.json');

function readDocs() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(DOCS_DIR, f), 'utf8');
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed parsing', f, e.message);
      return null;
    }
  }).filter(Boolean);
}

// Simple search index implementation (without elasticlunr for now)
function createSimpleIndex(docs) {
  const index = {};
  const wordMap = {};
  
  docs.forEach(doc => {
    if (!doc.id) return;
    
    // Tokenize title and content
    const text = `${doc.title || ''} ${doc.content || ''}`.toLowerCase();
    const words = text.split(/\W+/).filter(word => word.length > 2);
    
    words.forEach(word => {
      if (!wordMap[word]) wordMap[word] = [];
      if (!wordMap[word].includes(doc.id)) {
        wordMap[word].push(doc.id);
      }
    });
  });
  
  return { wordMap, docs: docs.reduce((acc, doc) => {
    if (doc.id) acc[doc.id] = doc;
    return acc;
  }, {}) };
}

function build() {
  const docs = readDocs();
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const { wordMap, docs: docsMap } = createSimpleIndex(docs);
  
  const searchIndex = {
    wordMap,
    docs: Object.keys(docsMap)
  };

  fs.writeFileSync(INDEX_PATH, JSON.stringify(searchIndex), 'utf8');
  fs.writeFileSync(DOCS_OUT, JSON.stringify(docsMap), 'utf8');
  console.log('Built simple search index with', Object.keys(docsMap).length, 'documents');
}

build();