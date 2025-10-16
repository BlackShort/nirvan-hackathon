# Local File Server & Download System

This application allows you to use your laptop as a file server and provides a web interface to browse and download files.

## 🚀 Features

- **File Listing**: Browse all files available on your server
- **Download Files**: Download individual files or multiple files at once
- **File Information**: See file size, type, and last modified date
- **Beautiful UI**: Modern, responsive interface with Perplexity-style design
- **Search Functionality**: Search through your local documents
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📁 Setup Instructions

### 1. Configure File Directory

Edit the `FILES_DIRECTORY` path in `backend/controllers/fileController.js`:

```javascript
// Option 1: Use the default docs folder (current setup)
const FILES_DIRECTORY = path.join(__dirname, '..', 'data', 'docs');

// Option 2: Use any folder on your system
// Windows example:
const FILES_DIRECTORY = 'C:\\Users\\YourName\\Documents\\SharedFiles';

// macOS/Linux example:
const FILES_DIRECTORY = '/home/username/shared-files';
```

### 2. Start the Backend Server

```bash
cd backend
npm install
npm start
```

The server will run on `http://localhost:5000`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📱 Usage

### File Browser
1. Open your browser and go to `http://localhost:5173`
2. Click on the "Files" tab
3. Browse available files from your server
4. Select multiple files using checkboxes
5. Download individual files or all selected files

### Search
1. Click on the "Search" tab
2. Enter your search query
3. Get AI-powered responses with source references

## 🔧 API Endpoints

### Files API
- `GET /api/files/list` - Get list of all files
- `GET /api/files/download/:filename` - Download a specific file

### Search API
- `POST /api/search` - Search through documents

## 🛡️ Security Features

- **Path Traversal Protection**: Prevents access to files outside the designated directory
- **File Validation**: Ensures only actual files can be downloaded
- **CORS Configuration**: Properly configured for local development

## 📂 Supported File Types

The system recognizes and provides appropriate icons for:
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, JPEG, PNG, GIF
- Videos: MP4, AVI, MOV
- Audio: MP3, WAV
- Archives: ZIP, RAR, 7Z
- Data: JSON, CSV, XLSX, XLS
- Presentations: PPT, PPTX

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **File Icons**: Visual indicators for different file types
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Multi-selection**: Select and download multiple files
- **File Details**: Size, type, and modification date

## 🔧 Customization

### Adding More File Types
Edit the `getFileType` function in `fileController.js` to add support for more file extensions.

### Changing the Files Directory
Update the `FILES_DIRECTORY` constant to point to any folder on your system.

### Styling
Modify the Tailwind CSS classes in the React components to customize the appearance.

## 🚨 Troubleshooting

### Files Not Showing
1. Check if the `FILES_DIRECTORY` path exists
2. Ensure the server has read permissions for the directory
3. Check browser console for any errors

### Download Not Working
1. Verify the file exists in the directory
2. Check if the server is running on port 5000
3. Ensure CORS is properly configured

### Server Not Starting
1. Make sure port 5000 is not in use
2. Check if all npm dependencies are installed
3. Verify the .env file configuration

## 📝 Notes

- The system is designed for local network use
- For production deployment, add proper authentication and security measures
- The file listing is refreshed each time you visit the Files tab
- Large files will stream properly without loading entirely into memory

## 🤝 Contributing

Feel free to enhance the system by:
- Adding file preview functionality
- Implementing file upload
- Adding user authentication
- Creating file organization features