import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure the folder where your files are stored
// You can change this path to any folder on your system

// Option 1: Use the existing docs folder (current setup)
const FILES_DIRECTORY = path.join(__dirname, '..', 'data', 'docs');

// Option 2: Use any folder on your system (uncomment and modify as needed)
// Windows examples:
// const FILES_DIRECTORY = 'C:\\Users\\YourName\\Documents\\SharedFiles';
// const FILES_DIRECTORY = 'C:\\SharedFiles';

// macOS/Linux examples:
// const FILES_DIRECTORY = '/home/username/shared-files';
// const FILES_DIRECTORY = '/Users/username/Documents/SharedFiles';

// @desc    Get list of files in the server directory
// @route   GET /api/files/list
// @access  Public
export const listFiles = async (req, res) => {
    try {
        // Check if directory exists
        if (!fs.existsSync(FILES_DIRECTORY)) {
            return res.status(404).json({
                success: false,
                message: 'Files directory not found'
            });
        }

        // Read directory contents
        const files = fs.readdirSync(FILES_DIRECTORY);
        
        // Get file details
        const fileDetails = files.map(filename => {
            const filePath = path.join(FILES_DIRECTORY, filename);
            const stats = fs.statSync(filePath);
            
            return {
                name: filename,
                size: stats.size,
                sizeFormatted: formatFileSize(stats.size),
                lastModified: stats.mtime,
                isDirectory: stats.isDirectory(),
                extension: path.extname(filename),
                type: getFileType(filename)
            };
        }).filter(file => !file.isDirectory); // Only return files, not directories

        res.json({
            success: true,
            data: {
                files: fileDetails,
                totalFiles: fileDetails.length,
                directory: FILES_DIRECTORY
            }
        });

    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list files',
            error: error.message
        });
    }
};

// @desc    Download a specific file
// @route   GET /api/files/download/:filename
// @access  Public
export const downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Sanitize filename to prevent path traversal attacks
        const sanitizedFilename = path.basename(filename);
        const filePath = path.join(FILES_DIRECTORY, sanitizedFilename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Check if it's actually a file (not a directory)
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file'
            });
        }

        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to read file'
            });
        });

    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
            error: error.message
        });
    }
};

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to determine file type
function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    const types = {
        '.pdf': 'PDF Document',
        '.doc': 'Word Document',
        '.docx': 'Word Document',
        '.txt': 'Text File',
        '.json': 'JSON File',
        '.csv': 'CSV File',
        '.xlsx': 'Excel File',
        '.xls': 'Excel File',
        '.ppt': 'PowerPoint',
        '.pptx': 'PowerPoint',
        '.jpg': 'Image',
        '.jpeg': 'Image',
        '.png': 'Image',
        '.gif': 'Image',
        '.mp4': 'Video',
        '.avi': 'Video',
        '.mov': 'Video',
        '.mp3': 'Audio',
        '.wav': 'Audio',
        '.zip': 'Archive',
        '.rar': 'Archive',
        '.7z': 'Archive'
    };
    
    return types[ext] || 'Unknown';
}