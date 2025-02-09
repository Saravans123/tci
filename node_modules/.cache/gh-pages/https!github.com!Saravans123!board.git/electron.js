// Import required Electron modules
const { app, BrowserWindow } = require('electron')
const path = require('path')

// This function creates the application window
function createWindow() {
  // Create a new window with these settings
  const win = new BrowserWindow({
    width: 800,    // Initial window width
    height: 600,   // Initial window height
    webPreferences: {
      nodeIntegration: true,  // Enables Node.js in the renderer process
      contextIsolation: false // Allows direct access to Node.js APIs
    }
  })

  // There are two ways to load your React app:
  
  // 1. For development (when you're running React on localhost):
  // win.loadURL('http://localhost:3000')
  
  // 2. For production (loading the built files):
  win.loadFile('build/index.html')
}

// When Electron is ready, create the window
app.whenReady().then(() => {
  createWindow()
  
  // On macOS, create a new window when clicking the dock icon if no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {  // 'darwin' is macOS
    app.quit()
  }
})