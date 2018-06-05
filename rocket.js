// Require electron
const {app, BrowserWindow, Menu, webContents} = require('electron')

// Require autoUpdater
const autoUpdater = require('electron-updater').autoUpdater

const path = require('path')
const url = require('url')

// Global reference of the window object
let mainWindow

// Register autoUpdater
autoUpdater.checkForUpdatesAndNotify()

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

    mainWindow.on('resize', () => {
        const [width, height] = mainWindow.getContentSize()
        for (let wc of webContents.getAllWebContents()) {
            // Check if `wc` belongs to a webview in the `mainWindow` window.
            if (wc.hostWebContents && wc.hostWebContents.id === mainWindow.webContents.id) {
                wc.setSize({
                    normal: {
                        width: width,
                        height: height
                    }
                })
            }
        }
    })

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