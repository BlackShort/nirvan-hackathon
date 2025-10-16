import express from 'express';
import { listFiles, downloadFile } from '../controllers/fileController.js';

export const filesRouter = express.Router();

// @desc    Get list of files in the server directory
// @route   GET /api/files/list
// @access  Public
filesRouter.get('/list', listFiles);

// @desc    Download a specific file
// @route   GET /api/files/download/:filename
// @access  Public
filesRouter.get('/download/:filename', downloadFile);