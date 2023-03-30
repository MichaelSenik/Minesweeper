'use strict'

const MINE = '💣'
const FLAG = '🚩'
var gBoard
var gLevel
var gGame
var clicks
var lives
var elLives
var smiley
var flags
var elClicks
var gInterval
var previousBtn

function onInit() {
    gLevel = {
        SIZE: 7,
        MINES: 3
    }
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    clicks = 0
    lives = 3
    flags = 0
    previousBtn = document.querySelector('.levels button')
    smiley = document.querySelector('.restart-btn')
    smiley.innerHTML = '<img src="img/pngwing.com.png"></img>'
    elClicks = document.querySelector('.clicks')
    elClicks.innerText = clicks
    clearInterval(gInterval)
    document.querySelector('.timer').innerText = '0'
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    withoutContextMenu()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        const row = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            row.push(cell)
        }
        board.push(row)
    }
    // board[2][1].isMine = true
    // board[0][2].isMine = true
    // board[0][3].isMine = true
    return board
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            // var cell = mat[i][j]
            var className = `cell cell-${i}-${j} `
            // if (cell.isMine) {
            //     className += 'bomb '
            // }
            // if (cell.isShown) className += 'shown'

            strHTML += `<td class="${className}" onclick="onCellClicked(${i},${j}, this)" oncontextmenu="onRightClick(${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    elLives = document.querySelector('.lives')
    elLives.innerHTML = `${lives} LIVES LEFT `
    for(var i = 0; i < lives; i++) {
        elLives.innerHTML +='♥'
    }
}

function onCellClicked(i, j, elCell) {
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    var value
    var addClass
    gBoard[i][j].isShown = true
    gGame.shownCount++
    clicks++
    if (clicks === 1) {
        createMines()
        timer()
    }
    countNegs(i, j)
    if (gBoard[i][j].isMine) {
        value = MINE
        addClass = 'mine'
        lives--
        elLives.innerHTML = `${lives} LIVES LEFT `
        for(var x = 0; x < lives; x++) {
            elLives.innerHTML +='♥'
        }
        if (lives === 0) gameOver(false)
    } else {
        if (gBoard[i][j].minesAroundCount === 0) {
            value = ''
            expandShown(i, j, elCell)
        } else value = gBoard[i][j].minesAroundCount

        addClass = 'shown'
    }
    elCell.style.border = '1px solid gray'
    elCell.style.width = '35px'
    elCell.style.height = '35px'
    elClicks.innerText = clicks
    renderCell(i, j, value, addClass)
    checkGameOver()
}

function renderCell(i, j, value, addClass) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.add(addClass)
    elCell.innerHTML = value
}

function createMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        const randomEmptyPos = findRandomEmptyPos()
        gBoard[randomEmptyPos.i][randomEmptyPos.j].isMine = true
    }
}

function gameOver(isVictory) {
    clearInterval(gInterval)
    gGame.isOn = false
    smiley.innerHTML = (isVictory) ? '<img src="img/pngwing.com (1).png"></img>' : '<img src="img/kindpng_57353.png"></img>'
}

function onRightClick(i, j) {
    if (!gGame.isOn) return
    const cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) {
        cell.isMarked = false
        flags--
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerHTML = ''
    } else if (flags < gLevel.MINES) {
        cell.isMarked = true
        flags++
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerHTML = FLAG
        checkGameOver()
    }
}

function expandShown(i, j) {
    var cellI = i
    var cellJ = j
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gLevel.SIZE) continue
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.style.border = '1px solid gray'
                elCell.style.width = '35px'
                elCell.style.height = '35px'
                gBoard[i][j].isShown = true
                gGame.shownCount++
                countNegs(i, j)
                const value = (gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : ''
                renderCell(i, j, value, 'shown')
            }
        }
    }
}

function checkGameOver() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) return
            if (lives === 0) return
        }
    }
    gameOver(true)
}

function timer() {
    var startTime = Date.now();
    const elTimer = document.querySelector('.timer')
    gInterval = setInterval(function () {
        var elapsedTime = Date.now() - startTime;
        elTimer.innerText = parseInt((elapsedTime / 1000));
    }, 100);
}

function onLevels(elBtn) {
    if (elBtn != previousBtn) {
        previousBtn.style.backgroundColor = 'whitesmoke'
        previousBtn.style.fontWeight = '100'
    }
    elBtn.style.backgroundColor = 'red'
    elBtn.style.fontWeight = '900'
    previousBtn = elBtn
}