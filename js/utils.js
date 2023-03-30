'use strict'

function countNegs(i, j) {
    var cellI = i
    var cellJ = j
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gLevel.SIZE) continue
            if (gBoard[i][j].isMine) negsCount++
        }
    }
    gBoard[cellI][cellJ].minesAroundCount = negsCount
    console.log('negsCount :>> ', negsCount);
}

function findRandomEmptyPos() {
    const emptyPositions = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (!cell.isMine && !cell.isShown){
                const pos = {i, j}
                emptyPositions.push(pos)
            }
        }
    }
    const randomEmptyPos = emptyPositions[getRandomInt(0,emptyPositions.length)]
    return randomEmptyPos
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function withoutContextMenu() {
    const noRightClick = document.querySelectorAll('.cell')
    for (var i = 0; i < gLevel.SIZE * gLevel.SIZE; i++) {
        noRightClick[i].addEventListener("contextmenu", e => e.preventDefault())
    }
}