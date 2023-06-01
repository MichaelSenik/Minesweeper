'use strict'

const STORAGE_KEY = 'memeDB'

var gSavedMemes



function getSavedMemes() {
    let memes = loadFromStorage(STORAGE_KEY)
    if (!memes || !memes.length) {
        memes = []
    }

    gSavedMemes = memes
    return gSavedMemes
}

function addSavedMeme() {
    const memes = getSavedMemes()
    // gMeme.isLineSelected = false
    // renderMeme()
    memes.push({ ...getMeme(), src: getMemeSrc() })
    saveMemesToStorage()
}

// problem with this: will find the *FIRST* saved meme with this imgId, could be more saved memes with the same imgId
function getSavedMeme(imgId) {
    return gSavedMemes.find(meme => meme.selectedImgId === imgId)
}

function setCurrentMeme(imgId) {
    const savedMeme = getSavedMeme(imgId)
    gMeme = savedMeme
}

function saveMemesToStorage() {
    saveToStorage(STORAGE_KEY, gSavedMemes)
}

// simply for downloading a saved meme from the saved memes gallery
function getMemeSrc() {
    return gElCanvas.toDataURL()
}

