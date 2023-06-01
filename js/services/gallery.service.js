'use strict'

const IMAGE_COUNT = 18
const IMAGE_KEY = 'imageDB'

// global vars
var gKeywordSearchCountMap
var gFilterKeyword = 'funny'
var gImgs
// var gImgs = [{ id: 1, url: 'img/1.jpg', keywords: ['funny', 'cat'] }];

_createImgs()

// list
function getImgs() {
    // filter by keywords
    const elKeyword = document.querySelector('#gallery-search')
    const keyword = elKeyword.value
    let imgs = null
    if (!keyword) imgs = gImgs
    else {
        imgs = gImgs.filter(img => img.keywords.includes(keyword))
    }
    return imgs
}

// create
function _createImg(imgId, imgUrl, keywords) {
    return {
        id: imgId,
        url: imgUrl,
        keywords: keywords
    }
}

function _createImgs() {
    var imgs = loadFromStorage(IMAGE_KEY)
    if (!imgs || !imgs.length) {
        imgs = []
        for (let i = 1; i <= IMAGE_COUNT; i++) {
            imgs.push(_createImg(i, `img/${i}.jpg`, getRandomKeywords()))
        }

    }
    gImgs = imgs
    saveToStorage(IMAGE_KEY, gImgs)
}
// read
function findImgById(imgId) {
    return gImgs.find(img => img.id === imgId)
}

function countKeywords () {
    return gImgs.reduce((map, img) => {
        img.keywords.forEach(keyword => {
            if(!map[keyword]) map[keyword] = 1
            else map[keyword]++
        })
        return map
    }, {})
}
// update
// delete

