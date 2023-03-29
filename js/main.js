'use strict'

const MINE = '💣'
const FLAG = '🚩'
var gBoard
var gLevel
var gGame
var cliks
var lives
var elLives
var smiley

function onInit() {
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    cliks = 0
    lives = 3
    smiley = document.querySelector('.restart-btn')
    smiley.innerHTML = '😀'
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

            strHTML += `<td class="${className}" onclick="onCellClicked(${i},${j})" oncontextmenu="onRightClick(${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    elLives = document.querySelector('.lives')
    elLives.innerHTML = `${lives} LIVES LEFT`
}

function onCellClicked(i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    var value
    var addClass
    gBoard[i][j].isShown = true
    gGame.isShown++
    cliks++
    if (cliks === 1) createMines()
    countNegs(i, j)
    if (gBoard[i][j].isMine) {
        value = MINE
        addClass = 'mine'
        lives--
        elLives.innerHTML = `${lives} LIVES LEFT`
        if (lives === 0) gameOver(false)
    } else {
        if (gBoard[i][j].minesAroundCount === 0) {
            value = ''
            expandShown(i, j)
        } else value = gBoard[i][j].minesAroundCount
        addClass = 'shown'
    }
    renderCell(i, j, value, addClass)
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
    gGame.isOn = false
    smiley.innerHTML = (isVictory) ? '😎' : '🤯'
}

function onRightClick(i, j) {
    if (!gGame.isOn) return
    const cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) {
        cell.isMarked = false
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerHTML = ''
    } else {
        cell.isMarked = true
        const elCell = document.querySelector(`.cell-${i}-${j}`)
        elCell.innerHTML = FLAG
    }
}

function withoutContextMenu() {
    const noRightClick = document.querySelectorAll('.cell')
    for (var i = 0; i < gLevel.SIZE * gLevel.SIZE; i++) {
        noRightClick[i].addEventListener("contextmenu", e => e.preventDefault())
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
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                countNegs(i, j)
                const value = (gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : ''
                renderCell(i, j, value, 'shown')
            }
        }
    }
}