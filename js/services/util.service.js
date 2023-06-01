'use strict'

function makeId(length = 6) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var txt = ''
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function getRandomKeywords(length = 2) {
    let keywords = ['funny', 'cat', 'dog', 'meme', 'baby']
    let randKeywords = []
    
    for (let i = 0; i < length; i++) {
        let randIdx = getRandomIntInclusive(0, keywords.length - 1)
        randKeywords.push(keywords[randIdx])
        keywords.splice(randIdx, 1)
    }

    return randKeywords
}

function makeLorem(wordCount = 100) {
    const words = ['The sky', 'above', 'the port', 'was', 'the color of television', 'tuned', 'to', 'a dead channel', '.', 'All', 'this happened', 'more or less', '.', 'I', 'had', 'the story', 'bit by bit', 'from various people', 'and', 'as generally', 'happens', 'in such cases', 'each time', 'it', 'was', 'a different story', '.', 'It', 'was', 'a pleasure', 'to', 'burn']
    var txt = ''
    while (wordCount > 0) {
        wordCount--
        txt += words[Math.floor(Math.random() * words.length)] + ' '
    }
    return txt
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}


function showElement(selector) {
    document.querySelector(selector).classList.remove('display-none')
}

function hideElement(selector) {
    document.querySelector(selector).classList.add('display-none')
}

function addActiveLink(selector) {
    // get all header links -> remove active
    // set active for selector
    document.querySelector(selector).classList.add('active')
}

function removeActiveLink(selector) {
    document.querySelector(selector).classList.remove('active')
}