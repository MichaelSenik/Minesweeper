'use strict'

const DIRECTION_BOTTOM = 1
const DIRECTION_TOP = -1

const EMOJI_DISPLAY_COUNT = 4

// global vars
var gMeme = {
    selectedImgId: 5,
    lineDirection: DIRECTION_BOTTOM,
    isLineSelected: false, // need this for 2 cases: editing a selected line or simply adding a new line
    selectedLineIdx: 0,
    lines: []
}

var gEmojis = ['😂', '🤣', '❤', '👌', '✔', '🎁', '🐱‍👓', '😎']
var gEmojiIdx = 0

// return current meme we're working on
function getMeme() {
    return gMeme
}

function getLine() {
    // check isSelected?
    if (!gMeme.lines.length) return null
    return gMeme.lines[gMeme.selectedLineIdx]
}

function getEmojis() {
    let startIdx = gEmojiIdx * EMOJI_DISPLAY_COUNT
    let endIdx = startIdx + EMOJI_DISPLAY_COUNT

    return gEmojis.slice(startIdx, endIdx)
}

function setEmojiIdx(diff) {
    gEmojiIdx += diff
    if(gEmojiIdx < 0) gEmojiIdx = Math.floor(gEmojis.length / EMOJI_DISPLAY_COUNT) - 1
    else if (gEmojiIdx === Math.floor(gEmojis.length / EMOJI_DISPLAY_COUNT)) gEmojiIdx = 0
}

function getLineText() {
    const line = getLine()
    if (!line) return null
    return line.txt
}

function clearMemeLines() {
    gMeme.lines = []
    gMeme.selectedLineIdx = 0
    gMeme.isLineSelected = false
}

// calc x,y xEnd, yEnd (for drag and drop and selecting text lines)
function getLineBorder(line) {
    let blockPadding = 10
    let inlinePadding = 10

    let x = line.pos.x - inlinePadding
    let y = line.pos.y - blockPadding

    let width = gCtx.measureText(line.txt).width

    if (line.align === 'center') {
        x -= width * 0.5
    }
    else if (line.align === 'end') {
        x -= width
    }

    let xEnd = x + width + inlinePadding * 2
    let yEnd = y + line.size + blockPadding * 2
    return { x, y, xEnd, yEnd }
}

// return line object within the line border
function getSelectedLine(x, y) {
    return gMeme.lines.find(line => {
        const lineBorder = getLineBorder(line)
        return x <= lineBorder.xEnd && x >= lineBorder.x && y <= lineBorder.yEnd && y >= lineBorder.y
    })
}

// return undefined(false) if no line was clicked
function isLineClicked(pos) {
    return getSelectedLine(pos.x, pos.y)
}

// find index of clicked line and focus
function setSelectedLine(pos) {
    const lineClicked = getSelectedLine(pos.x, pos.y)
    if (lineClicked) {
        gMeme.selectedLineIdx = gMeme.lines.findIndex(line => line.pos.x === lineClicked.pos.x && line.pos.y === lineClicked.pos.y)
        gMeme.isLineSelected = true
    }
    else {
        gMeme.isLineSelected = false
    }
}

// UPDATE
function setLineTxt(txt, lineIdx) {
    gMeme.lines[lineIdx].txt = txt
}

function setImg(imgId) {
    gMeme.selectedImgId = imgId
}

// TODO: adjust position after alignment -> prevent canvas overflow
function setAlign(align) {
    if (!gMeme.isLineSelected) return
    gMeme.lines[gMeme.selectedLineIdx].align = align
}

function setFont(font) {
    if (!gMeme.isLineSelected) return
    gMeme.lines[gMeme.selectedLineIdx].font = font
}

function setFontSize(size) {
    if (!gMeme.isLineSelected) return
    gMeme.lines[gMeme.selectedLineIdx].size += size
}

function setColor(color) {
    if (!gMeme.isLineSelected) return
    gMeme.lines[gMeme.selectedLineIdx].color = color
}

function setFill(color) {
    if (!gMeme.isLineSelected) return
    gMeme.lines[gMeme.selectedLineIdx].fill = color
}

function setLineDrag(newState) {
    if (!gMeme.isLineSelected) return
    gMeme.lines[gMeme.selectedLineIdx].isDrag = newState
}

// CREATE
function addLine(txt, size, pos, align, color, isDrag = false, fill, font) {
    gMeme.lines.push({ txt, size, pos, align, color, isDrag, fill, font })
}

// DELETE
function deleteLine() {
    if (!gMeme.isLineSelected || !gMeme.lines.length) return
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
    gMeme.selectedLineIdx = 0
    gMeme.isLineSelected = false
}

// UPDATE
function moveLine(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].pos.x += dx
    gMeme.lines[gMeme.selectedLineIdx].pos.y += dy
}

function switchLine() {
    const lines = gMeme.lines.length
    if (!lines) {
        gMeme.isLineSelected = false
        gMeme.selectedLineIdx = 0
        return
    }

    if (lines === 1) {
        gMeme.selectedLineIdx = 0
        gMeme.isLineSelected = true
        return
    }

    let newLineIdx = gMeme.selectedLineIdx + gMeme.lineDirection

    if (newLineIdx === lines) {
        gMeme.lineDirection = DIRECTION_TOP
        newLineIdx -= 2
        gMeme.selectedLineIdx = newLineIdx
    }
    else if (newLineIdx === -1) {
        gMeme.lineDirection = DIRECTION_BOTTOM
        newLineIdx += 2
        gMeme.selectedLineIdx = newLineIdx
    }
    else {
        gMeme.selectedLineIdx = newLineIdx
    }

    gMeme.isLineSelected = true
}
