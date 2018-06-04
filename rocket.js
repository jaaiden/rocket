// Require electron
const {app, BrowserWindow, Menu} = require('electron')

const path = require('path')
const url = require('url')

// Global reference of the window object
let mainWindow

function createWindow () {
    // Create browser window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        frame: false,
        // titleBarStyle: 'hidden'
        titleBarStyle: 'customButtonsOnHover'
    })

    // Load index.html in the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }))

    // Open devtools
    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit()
})

app.on('activate', function () {
    if (mainWindow === null)
        createWindow()
})