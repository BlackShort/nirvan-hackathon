import express from 'express';
import { searchQuery, searchDocument, cacheQuery } from '../controllers/searchController.js';

export const searchRouter = express.Router();

// @desc    Search a query
// @route   POST /api/search/search
// @access  Public
searchRouter.post('/search', searchQuery);

// @desc    Search a document by ID
// @route   POST /api/search/:id
// @access  Public
searchRouter.post('/:id', searchDocument);

// @desc    Cache a query result for offline use
// @route   POST /api/search/cache
// @access  Public
searchRouter.post('/cache', cacheQuery);