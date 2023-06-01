'use strict'

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

// global vars
var gElCanvas
var gCtx

var gCanvasWidth
var gCanvasHeight
var gStartPos


// ?
function onInitCanvas() {
    gElCanvas = document.querySelector('.meme-canvas')
    gElCanvas.width = 500
    gElCanvas.height = 500
    gCtx = gElCanvas.getContext('2d')
    resizeCanvas()
    renderEmojis()
    addEventListeners()
}

function renderMeme() {
    const meme = getMeme()
    drawImg(meme.selectedImgId)
}

function renderEmojis() {
    const elEmojiContainer = document.querySelector('.emoji-display')
    const emojis = getEmojis()
    let emojiHTML = ''

    emojiHTML = emojis.map(emoji => `<span class="emoji" onclick="onAddEmoji('${emoji}')">${emoji}</span>`).join('')

    elEmojiContainer.innerHTML = emojiHTML
}

function onAddEmoji(emojiStr) {
    const meme = getMeme()
    addLine(emojiStr, 40, { x: gCanvasWidth / 2, y: gCanvasHeight / 2 }, 'center', 'black', false, 'white', 'Impact')
    meme.selectedLineIdx = meme.lines.length - 1
    meme.isLineSelected = true
    renderMeme()
}

function onPrevEmoji() {
    setEmojiIdx(-1)
    renderEmojis()
}

function onNextEmoji() {
    setEmojiIdx(1)
    renderEmojis()
}

// called when text input is changed (onchange event)
function onSetLineText(elText) {
    const txt = elText.value
    const meme = getMeme()
    // update
    if (meme.isLineSelected) {
        setLineTxt(txt, meme.selectedLineIdx)
    }

    renderMeme()
}

// resize canvas on('resize', resizeCanvas)
function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight

    gCanvasWidth = gElCanvas.width
    gCanvasHeight = gElCanvas.height

    renderMeme()
}

// call this drawImg&Lines
function drawImg(imgId) {
    const elImg = new Image() // Create a new html img element
    elImg.src = `img/${imgId}.jpg` // Send a network req to get that image, define the img src
    // When the image ready draw it on the canvas
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
        drawLines()
    }
}

function drawText(line, idx) {
    const meme = getMeme()
    // apply meme options
    gCtx.lineWidth = 2
    gCtx.strokeStyle = line.color
    gCtx.fillStyle = line.fill
    gCtx.font = `${line.size}px ${line.font || 'Impact'}`
    gCtx.textAlign = line.align
    gCtx.textBaseline = 'top'

    gCtx.fillText(line.txt, line.pos.x, line.pos.y) // Draws (fills) a given text at the given (x, y) position.
    gCtx.strokeText(line.txt, line.pos.x, line.pos.y) // Draws (strokes) a given text at the given (x, y) position.
    if (meme.isLineSelected && meme.selectedLineIdx === idx) {
        const { x, y, xEnd, yEnd } = getLineBorder(line)
        gCtx.strokeRect(x, y, xEnd - x, yEnd - y)
    }
}

// draw all lines after image is rendered
function drawLines() {
    const meme = getMeme()
    // if no lines -> add empty line and have it marked for filling
    if (!meme.lines.length && gIsFirstLoad) {
        onAddLine()
        gIsFirstLoad = false
    }
    meme.lines.forEach((line, idx) => {
        drawText(line, idx)
    })
}

function onAddLine() {
    const elInputText = document.querySelector('#lineText')
    const lineText = elInputText.value || elInputText.placeholder
    const meme = getMeme()
    let lineCount = meme.lines.length
    // default line
    let textAlign = 'center'
    let textStroke = 'black'
    let textFont = 'Impact'
    let textFill = 'white'
    let fontSize = 40
    let drag = false
    // first line - top
    if (lineCount === 0) {
        addLine(lineText, fontSize, { x: gCanvasWidth / 2, y: gCanvasHeight / 10 }, textAlign, textStroke, drag, textFill, textFont)
    }
    // second line - bottom
    else if (lineCount === 1) {
        addLine(lineText, fontSize, { x: gCanvasWidth / 2, y: gCanvasHeight * 0.85 }, textAlign, textStroke, drag, textFill, textFont)
    }
    // rest center
    else {
        addLine(lineText, fontSize, { x: gCanvasWidth / 2, y: gCanvasHeight / 2 }, textAlign, textStroke, drag, textFill, textFont)
    }

    meme.selectedLineIdx = meme.lines.length - 1
    meme.isLineSelected = true
    renderMeme()
}

function onSwitchLine() {
    switchLine()
    updateInputText(getLineText())
    renderMeme()
}

function updateInputText(txt) {
    document.querySelector('#lineText').value = txt
}

function onDeleteLine() {
    deleteLine()
    updateInputText('')
    renderMeme()
}

function onSetFont(font) {
    setFont(font)
    renderMeme()
}

function onSetFontSize(size) {
    setFontSize(size)
    renderMeme()
}

function onSetColor(color) {
    setColor(color)
    renderMeme()
}

function onSetFill(color) {
    setFill(color)
    renderMeme()
}

// L / R / C
function onSetAlign(align) {
    setAlign(align)
    renderMeme()
}

function onSetSelectedLine(pos) {
    setSelectedLine(pos)
    updateInputText(getLineText())
    renderMeme()
}

// add event listeners
function addEventListeners() {
    addMouseEvents()
    addTouchEvents()
    // TODO: add event listeners to buttons
    window.addEventListener('resize', () => {
        resizeCanvas()
        renderMeme()
    })
}

function addMouseEvents() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchEvents() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

function onDown(ev) {
    // Get the ev pos from mouse or touch
    const pos = getEvPos(ev)
    // console.log('pos:', pos)
    if (!isLineClicked(pos)) {
        getMeme().isLineSelected = false
        updateInputText('')
        renderMeme()
        return
    }
    // set selected line
    onSetSelectedLine(pos)
    setLineDrag(true)
    //Save the pos we start from
    gStartPos = pos
    document.body.style.cursor = 'grabbing'
}

function onMove(ev) {
    if (!getLine()) return
    const { isDrag } = getLine()
    if (!isDrag) return

    const pos = getEvPos(ev)
    // Calc the delta , the diff we moved
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y
    moveLine(dx, dy)
    // Save the last pos , we remember where we`ve been and move accordingly
    gStartPos = pos
    // The canvas is rendered again after every move
    renderMeme()
}

function onUp() {
    setLineDrag(false)
    document.body.style.cursor = 'grab'
    document.body.style.cursor = 'unset'
}

function getEvPos(ev) {
    // Gets the offset pos , the default pos
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }
    // Check if its a touch ev
    if (TOUCH_EVS.includes(ev.type)) {
        //soo we will not trigger the mouse ev
        ev.preventDefault()
        //Gets the first touch point
        ev = ev.changedTouches[0]

        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

/////////////////////////////////////////////////
function downloadCanvas(elLink) {
    // TODO: fix this
    // cleanSelection()
    getMeme().isLineSelected = false
    renderMeme()

    elLink.download = 'my-img'
    const data = gElCanvas.toDataURL()
    elLink.href = data
}

function onShareMeme() {
    const imgDataUrl = gElCanvas.toDataURL('image/jpeg') // Gets the canvas content as an image format

    // A function to be called if request succeeds
    function onSuccess(uploadedImgUrl) {
        // Encode the instance of certain characters in the url
        const encodedUploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        console.log(encodedUploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUploadedImgUrl}&t=${encodedUploadedImgUrl}`)
    }
    // Send the image to the server
    doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
    // Pack the image for delivery
    const formData = new FormData()
    formData.append('img', imgDataUrl)

    // Send a post req with the image to the server
    const XHR = new XMLHttpRequest()
    XHR.onreadystatechange = () => {
        // If the request is not done, we have no business here yet, so return
        if (XHR.readyState !== XMLHttpRequest.DONE) return
        // if the response is not ok, show an error
        if (XHR.status !== 200) return console.error('Error uploading image')
        const { responseText: url } = XHR
        // Same as
        // const url = XHR.responseText

        // If the response is ok, call the onSuccess callback function, 
        // that will create the link to facebook using the url we got
        console.log('Got back live url:', url)
        onSuccess(url)
    }
    XHR.onerror = (req, ev) => {
        console.error('Error connecting to server with request:', req, '\nGot response data:', ev)
    }
    XHR.open('POST', '//ca-upload.com/here/upload.php')
    XHR.send(formData)
}
