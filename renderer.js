const remote = require('electron').remote
const app = remote.app

const pace = require('pace-progress')

var ById = function (id) {
    return document.getElementById(id)
}

var jsonfile = require('jsonfile')
var favicon = require('favicon-getter').default
var path = require('path')
var uuid = require('uuid')
var snippets = path.join(__dirname, 'snippets.json')
var settings = require(path.join(__dirname, 'settings.json'))

var nav = ById('titlebar'),
    back = ById('back'),  
    forward = ById('forward'),
    refresh = ById('refresh'),
    omni = ById('omniurl'),
    settingsModal = ById('settings'),
    closeSettingsModal = ById('close-settingsModal'),
    dev = ById('console'),
    snip = ById('snip'),
    list = ById('list'),
    popup = ById('snip-popup'),
    view = ById('view'),
    ctx_minimize = ById('ctx-minimize'),
    ctx_maximize = ById('ctx-maximize'),
    ctx_close = ById('ctx-close')

if (remote.process.platform === 'darwin') {
    // Hide context menu buttons
    console.log('macOS -- hiding window buttons')
    ctx_minimize.style.display = 'none'
    ctx_maximize.style.display = 'none'
    ctx_close.style.display = 'none'
}

function reloadView () {
    view.reload()
}

function goBack () {
    view.goBack()
}

function goForward () {
    view.goForward()
}

function updateUrl (event) {
    if (event.keyCode === 13) {
        omni.blur()
        let val = omni.innerHTML // Use with editable div text
        // let val = omni.value // Use with input field
        if (validateUrl(val)) {
            let https = val.slice(0, 8).toLowerCase()
            let http = val.slice(0, 7).toLowerCase()
            if (https === 'https://' || http === 'http://')
                view.loadURL(val)
            else
                view.loadURL('http://' + val)
        }
        else {
            var customSchema = val.slice(0, 2).toLowerCase()
            var customSchemaSpace = val.slice(0, 3).toLowerCase()
            if (customSchema === 'v?')
                view.loadURL('https://duckduckgo.com/?q=' + val.substring(2) + '&iax=videos&ia=videos' + (settings.theme === 'dark' ? '&k1=-1&kae=d' : ''))
            else if (customSchemaSpace === 'v? ')
                view.loadURL('https://duckduckgo.com/?q=' + val.substring(2) + '&iax=videos&ia=videos' + (settings.theme === 'dark' ? '&k1=-1&kae=d' : ''))
            else if (customSchema === 'i?')
                view.loadURL('https://duckduckgo.com/?q=' + val.substring(2) + '&iax=images&ia=images' + (settings.theme === 'dark' ? '&k1=-1&kae=d' : ''))
            else if (customSchemaSpace === 'i? ')
                view.loadURL('https://duckduckgo.com/?q=' + val.substring(2) + '&iax=images&ia=images' + (settings.theme === 'dark' ? '&k1=-1&kae=d' : ''))
            else {
                // Search the web
                view.loadURL('https://duckduckgo.com/?q=' + val + (settings.theme === 'dark' ? '&k1=-1&kae=d' : ''))
            }
        }
    }
}

var Snip = function (id, url, faviconUrl, title) {
    this.id = id
    this.url = url
    this.icon = faviconUrl
    this.title = title
}

Snip.prototype.ELEMENT = function () {
    var a_tag = document.createElement('a')
    a_tag.href = this.url
    a_tag.textContent = this.title
    var favImg = document.createElement('img')
    favImg.src = this.icon
    a_tag.insertBefore(favImg, a_tag.childNodes[0])
    return a_tag
}

function addSnip () {
    let url = view.src
    let title = view.getTitle()
    favicon(url).then(function (fav) {
        let nSnip = new Snip(uuid.v1(), url, fav, title)
        jsonfile.readFile(snippets, function (err, curr) {
            curr.push(nSnip)
            jsonfile.writeFile(snippets, curr, function (err){})
        })
    })
}

function openPopup (event) {
    let state = popup.getAttribute('data-state')
    if (state === 'closed') {
        popup.innerHTML = ''
        jsonfile.readFile(snippets, function (err, obj) {
            if (obj.length !== 0) {
                for (var i = 0; i < obj.length; i++) {
                    let url = obj[i].url;
                    let icon = obj[i].icon;
                    let id = obj[i].id;
                    let title = obj[i].title;
                    let nSnip = new Snip(id, url, icon, title)
                    let el = nSnip.ELEMENT()
                    popup.appendChild(el)
                }
            }
            popup.style.display = 'block'
            popup.setAttribute('data-state', 'open')
        })
    }
    else {
        popup.style.display = 'none'
        popup.setAttribute('data-state', 'closed')
    }
}

function handleUrl (event) {
    if (event.target.className === 'link') {
        event.preventDefault()
        view.loadURL(event.target.innerHTML) // Use with editable div text
        // view.loadURL(event.target.value) // Use with input field
    }
    else if (event.target.className === 'favicon') {
        event.preventDefault()
        view.loadURL(event.target.parentElement.href)
    }
}

function handleDevtools () {  
    if (view.isDevToolsOpened()) {
        view.closeDevTools()
    } else {
        view.openDevTools()
    }
}

function updateNav (event) {  
    omni.innerHTML = view.src // Use with editable div text
    // omni.value = view.src // Use with input field
}

// Validate url
function validateUrl(value)
{
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
    var regexp = new RegExp(expression)
    return regexp.test(value)
} 

function selectOmniText() {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(omni);
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(omni);
        window.getSelection().addRange(range);
    }
}

function openSettings () {
    ById('settingsModal').classList.add('is-active')
}

function closeSettings () {
    ById('settingsModal').classList.remove('is-active')
}

refresh.addEventListener('click', reloadView)
back.addEventListener('click', goBack)
forward.addEventListener('click', goForward)
omni.addEventListener('keydown', updateUrl)
omni.addEventListener('click', selectOmniText)
settingsModal.addEventListener('click', openSettings)
closeSettingsModal.addEventListener('click', closeSettings)
snip.addEventListener('click', addSnip)
// list.addEventListener('click', openPopup)
// popup.addEventListener('click', handleUrl)
dev.addEventListener('click', handleDevtools)
view.addEventListener('did-start-loading', function () { pace.restart() })
view.addEventListener('did-finish-load', updateNav)


// Contextual menu buttons
ctx_close.addEventListener('click', function (e) { remote.getCurrentWindow().close() })
ctx_minimize.addEventListener('click', function (e) { remote.getCurrentWindow().minimize() })
ctx_maximize.addEventListener('click', function (e) {
  var window = remote.getCurrentWindow()
  if (!window.isMaximized()) window.maximize()
  else window.unmaximize()
})

// view.loadURL(settings.startpage)

// Load start page
// view.loadURL(settings.startpage + ((settings.startpage === 'https://duckduckgo.com/' || settings.startpage === 'https://start.duckduckgo.com/') && settings.theme === 'dark' ? '&k1=-1&kae=d' : ''))

// Set titlebar theme
nav.classList.add('is-' + settings.theme)