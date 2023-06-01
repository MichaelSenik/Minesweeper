'use strict'

var gIsFirstLoad = false

function onInitGallery() {
    hideElement('.meme-container')
    hideElement('.saved-memes')
    hideElement('.about')
    showElement('.img-gallery')
    showElement('.keywords')
    renderGallery()
    renderKeywords()
    removeActiveLink('.memes-link')
    removeActiveLink('.about-link')
    addActiveLink('.gallery-link')
}

function renderGallery() {
    const imgs = getImgs()
    let imgsHTML = ''

    imgsHTML += `<div class="add-image">
                    <span>Upload Image</span>
                    <input type="file" class="file-input" name="image" onchange="onImgInput(event)" />
                </div>`

    imgsHTML += imgs.map(img =>
        `<img src=${img.url} onclick='onImgSelect(${img.id})'>`
    ).join('')

    const elGallery = document.querySelector('.img-gallery')
    elGallery.innerHTML = imgsHTML
}

function renderKeywords() {
    const keywordsMap = countKeywords()
    const elKeywordContainer = document.querySelector('.keywords-list')
    let keywordHTML = ''
    for (var key in keywordsMap) {
        const fontSize = Math.floor(keywordsMap[key] * 3)
        const min = 16;
        const max = 48;
        const normalizedFontSize = (fontSize - min) / (max - min) * (max - min + 1) + min;
        keywordHTML += `<span onclick="onClickKeyword(this)" style="font-size: ${Math.floor(normalizedFontSize)}px">${key}</span>`
    }

    elKeywordContainer.innerHTML = keywordHTML
}

function onClickKeyword(elKeyword) {
    document.querySelector('#gallery-search').value = elKeyword.innerText.toLowerCase()
    renderGallery()
}

// TODO: upload own image to gallery
function onAddImage() {

}

function onImgSelect(imgId) {
    console.log(imgId)
    gIsFirstLoad = true
    setImg(imgId)
    clearMemeLines()
    hideElement('.img-gallery')
    hideElement('.keywords')
    hideElement('.about')
    showElement('.meme-container')
    onInitCanvas()
    renderMeme()
}


// The next 2 functions handle IMAGE UPLOADING to img tag from file system:
function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

// CallBack func will run on success load of the img
function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()
    // After we read the file
    reader.onload = function (event) {
        let img = new Image() // Create a new html img element
        img.src = event.target.result // Set the img src to the img file we read
        // Run the callBack func, To render the img on the canvas
        img.onload = onImageReady.bind(null, img)
    }
    reader.readAsDataURL(ev.target.files[0]) // Read the file we picked
}

function renderImg(img) {
    // Draw the img on the canvas
    hideElement('.img-gallery')
    hideElement('.keywords')
    showElement('.meme-container')
    onInitCanvas()
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}

function toggleMenu() {
    document.body.classList.toggle('menu-open');
}

function onInitAbout() {
    removeActiveLink('.memes-link')
    removeActiveLink('.gallery-link')
    addActiveLink('.about-link')
    hideElement('.meme-container')
    hideElement('.img-gallery')
    hideElement('.saved-memes')
    hideElement('.keywords')
    showElement('.about')
    renderAbout()
}

function renderAbout() {
    const elAboutContainer = document.querySelector('.about-container')
    let strHTML = ''

    strHTML += `<img src='img/1.jpg'>
                <article class='about-details'>
                    <h2>Shaul Rosenberg</h2>
                    <p>        
                        I am a team player. I am outgoing, dedicated, and open-minded. I get across to people and adjust to changes with ease. 
                        I believe that a person should work on developing their professional skills and learning new things all the time. Currently, 
                        I am looking for new career opportunities.
                    </p>
                    <div class='socials'>
                        <a href='https://www.facebook.com/shaul.rosenberg1/'><i class="fa-brands fa-facebook"></i></a>
                        <a href='https://www.linkedin.com/in/shaul-rosenberg/'><i class="fa-brands fa-linkedin"></i></a>
                        <a href='https://github.com/shaulrosenberg'><i class="fa-brands fa-github"></i></a>
                    </div>
                </article>`

    elAboutContainer.innerHTML = strHTML
}



