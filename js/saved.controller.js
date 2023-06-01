'use strict'



function onInitSavedMemes() {
    hideElement('.img-gallery')
    hideElement('.meme-container')
    hideElement('.keywords')
    showElement('.saved-memes')
    hideElement('.about')
    renderSavedMemes()
    removeActiveLink('.gallery-link')
    removeActiveLink('.about-link')
    addActiveLink('.memes-link')
}

function renderSavedMemes() {
    const savedMemes = getSavedMemes()
    let strHTML = ''

    if (!savedMemes || !savedMemes.length) {
        strHTML = `Create a meme and save it first!`
    }
    else {
        strHTML = savedMemes.map(meme =>
            `<img src=${meme.src} onclick='onEditMeme(${meme.selectedImgId})'>`
        ).join('')
    }

    const elContainer = document.querySelector('.saved-memes')
    elContainer.innerHTML = strHTML
}

function onSaveMeme() {
    // add entire gMeme Object in case of editing, but add meme.src = canvas.toDataURL() for gallery display
    // when rendering display images according to meme.src
    // when clicking to edit a meme -> go back to editor and load gMeme object
    addSavedMeme()
}

function onEditMeme(imgId) {
    setCurrentMeme(imgId)
    hideElement('.saved-memes')
    hideElement('.img-gallery')
    showElement('.meme-container')
    onInitCanvas()
    renderMeme()
}