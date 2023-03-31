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
var isHintOn
var hintCell
var hintsUsed
var isHintFinished
var currTime
var bestTime1
var bestTime2
var bestTime3
var currBest
var lvl
var safeClicks
var gTimeOut
var darkLight
var megaHintArea
var megaHintCount
var isMegaHintFinished
var isMegaHintOn
var isManualOn
var minesPlaced
var elManualBtn

function onInit(level = {
    SIZE: 4,
    MINES: 2
}) {
    gLevel = level
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    isHintOn = false
    clicks = 0
    lives = 3
    flags = 0
    hintsUsed = []
    isHintFinished = true
    safeClicks = 3
    megaHintArea = []
    megaHintCount = 0
    isMegaHintFinished = true
    isMegaHintOn = false
    isManualOn = false
    minesPlaced = 0
    if (!previousBtn) {
        previousBtn = document.querySelector('.levels button')
        previousBtn.style.backgroundColor = 'red'
        previousBtn.style.fontWeight = '900'
    }
    // if (localStorage.getItem("BestTime")) {
    bestScore()
    // bestTime = localStorage.getItem("BestTime")
    // document.getElementById("result").innerHTML = `Record Time is: ${bestTime}s`
    // }
    smiley = document.querySelector('.restart-btn')
    smiley.innerHTML = '<img src="img/pngwing.com.png"></img>'
    elClicks = document.querySelector('.clicks')
    elClicks.innerText = clicks
    const elSafeClicks = document.querySelector('span')
    elSafeClicks.innerText = safeClicks
    clearInterval(gInterval)
    clearInterval(gTimeOut)
    document.querySelector('.timer').innerText = '0'
    updateHints()
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    withoutContextMenu()
    toggleDarkLight()
    const elMegaHintBtn = document.querySelector('.megaHint')
    elMegaHintBtn.innerText = '1 Mega-Hint Left'
    elManualBtn = document.querySelector('.manual')
    elManualBtn.innerText = 'Manual Mode'
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
            var className = `cell cell-${i}-${j} `

            strHTML += `<td class="${className}" onclick="onCellClicked(${i},${j})" oncontextmenu="onRightClick(${i},${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
    elLives = document.querySelector('.lives')
    elLives.innerHTML = `${lives} LIVES LEFT `
    for (var i = 0; i < lives; i++) {
        elLives.innerHTML += '♥'
    }
}

function onCellClicked(i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    if (isManualOn && !gBoard[i][j].isMine) {
        minePlacing()
        gBoard[i][j].isMine = true
    } else if (isHintOn && clicks > 0 && isMegaHintFinished) {
        isHintFinished = false
        toggleNegs(i, j)
        isHintOn = false
        hintCell = {
            i,
            j
        }
        setTimeout(toggleNegs, 1000)
    } else if (isMegaHintOn && clicks > 0 && isHintFinished) {
        isMegaHintFinished = false
        findMegaHintArea(i, j)
    } else {
        if (!isMegaHintFinished || !isHintFinished || isManualOn) return
        var value
        var addClass
        clicks++
        gBoard[i][j].isShown = true
        gGame.shownCount++
        if (clicks === 1) {
            if (!minesPlaced) createMines()
            timer()
        }
        countNegs(i, j)
        if (gBoard[i][j].isMine) {
            value = MINE
            addClass = 'mine'
            lives--
            elLives.innerHTML = `${lives} LIVES LEFT `
            for (var x = 0; x < lives; x++) {
                elLives.innerHTML += '♥'
            }
            if (lives === 0) gameOver(false)
        } else {
            if (gBoard[i][j].minesAroundCount === 0) {
                value = ''
                expandShown(i, j)
            } else value = gBoard[i][j].minesAroundCount

            addClass = 'shown'
        }
        elClicks.innerText = clicks
        renderCell(i, j, value, addClass)
        checkGameOver()
    }
}

function renderCell(i, j, value, addClass) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.toggle(addClass)
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
    if (isVictory) {
        smiley.innerHTML = '<img src="img/pngwing.com (1).png"></img>'
        if (!currBest || currTime < parseFloat(currBest)) {
            localStorage.setItem(`.BestTime${lvl}`, currTime);
        }
    } else {
        smiley.innerHTML = '<img src="img/kindpng_57353.png"></img>'
    }
    clearInterval(gInterval)
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
        currTime = elapsedTime / 1000
        elTimer.innerText = parseInt(currTime);
    }, 100);
}

function onLevels(elBtn) {
    if (elBtn === previousBtn) return
    previousBtn.style.backgroundColor = 'whitesmoke'
    previousBtn.style.fontWeight = '100'
    elBtn.style.backgroundColor = 'red'
    elBtn.style.fontWeight = '900'
    previousBtn = elBtn
    if (elBtn.id === 'beginner') {
        gLevel = {
            SIZE: 4,
            MINES: 2
        }
    } else if (elBtn.id === 'medium') {
        gLevel = {
            SIZE: 8,
            MINES: 14
        }
    } else {
        gLevel = {
            SIZE: 12,
            MINES: 32
        }
    }
    onInit(gLevel)
}

function onRestart(elBtn) {
    elBtn.style.borderTop = '4px solid gray'
    elBtn.style.borderLeft = '4px solid gray'
    elBtn.style.borderRight = '3px solid white'
    elBtn.style.borderBottom = '3px solid white'
    setTimeout(() => {
        elBtn.style.border = '4px solid'
        elBtn.style.borderColor = 'white gray gray white'
    }, 300)
    onInit(gLevel)
}

function onHints(elBtn) {
    if (hintsUsed.includes(elBtn.id) || isHintOn || !isHintFinished) return
    isHintOn = true
    hintsUsed.push(elBtn.id)
    elBtn.style.backgroundColor = 'yellow'
}

function toggleNegs(i, j) {
    var cellI
    var cellJ
    if ((!i && i !== 0) || (!j && j !== 0)) {
        cellI = hintCell.i
        cellJ = hintCell.j
    } else {
        cellI = i
        cellJ = j
    }
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (gBoard[i][j].isShown) continue
            var value
            var addClass
            countNegs(i, j)
            if (gBoard[i][j].isMine) {
                value = MINE
                addClass = 'mine'
            } else {
                addClass = 'shown'
                value = (gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : ''
            }
            if (gBoard[i][j].isMarked) {
                flags--
            }
            if (!isHintOn) {
                renderCell(i, j, '', addClass)
                isHintFinished = true
            } else renderCell(i, j, value, addClass)
        }
    }
}

function updateHints() {
    for (var i = 0; i < 3; i++) {
        const hint = document.querySelectorAll('.hints button')
        hint[i].style.backgroundColor = 'whitesmoke'
    }
}

function bestScore() {
    switch (gLevel.SIZE) {
        case 4:
            bestTime1 = localStorage.getItem('BestTime1')
            currBest = bestTime1
            lvl = 1
            break
        case 8:
            bestTime2 = localStorage.getItem('.BestTime2')
            currBest = bestTime2
            lvl = 2
            break
        case 12:
            bestTime3 = localStorage.getItem('.BestTime3')
            currBest = bestTime3
            lvl = 3
    }
    document.querySelector('#result').innerHTML = `Record Time is: ${currBest}s`
    console.log('currBest :>> ', currBest);
    console.log(`BestTime${lvl}`);

}

function safeClick(elBtn) {
    if (clicks === 0 || safeClicks === 0) return
    const emptyPos = findRandomEmptyPos()
    countNegs(emptyPos.i, emptyPos.j)
    const value = (gBoard[emptyPos.i][emptyPos.j].minesAroundCount > 0) ? gBoard[emptyPos.i][emptyPos.j].minesAroundCount : ''
    renderCell(emptyPos.i, emptyPos.j, value, 'shown')
    gBoard[emptyPos.i][emptyPos.j].isShown = true
    gBoard[emptyPos.i][emptyPos.j].isShown = true
    safeClicks--
    elBtn.querySelector('span').innerText = safeClicks
    gTimeOut = setTimeout(() => {
        gBoard[emptyPos.i][emptyPos.j].isShown = false
        renderCell(emptyPos.i, emptyPos.j, '', 'shown')
    }, 2000)
}

function toggleDarkLight(elBtn) {
    const elBody = document.body;
    var currClass
    if (!elBtn) {
        elBtn = document.querySelector('.dark-light')
        if (!darkLight || darkLight === 'light') currClass = 'dark-mode'
        else currClass = 'light-mode'
    } else currClass = elBody.className;
    if (currClass === "dark-mode") {
        elBody.className = "light-mode"
        elBtn.innerText = '🌞'
        darkLight = 'light'
    } else {
        elBody.className = "dark-mode"
        elBtn.innerText = '🌙'
        darkLight = 'dark'
    }
}

function findMegaHintArea(i, j) {
    const cell = {
        i,
        j
    }
    megaHintArea.push(cell)
    if (megaHintCount === 1) megaHint(megaHintArea[0], megaHintArea[1])
    if (megaHintCount === 1) {
        isMegaHintOn = false
        setTimeout(megaHint, 2000)
    }
    megaHintCount++
}

function megaHint(location1, location2) {
    if (!location1 || !location2) {
        location1 = megaHintArea[0]
        location2 = megaHintArea[1]
    }
    for (var i = location1.i; i <= location2.i; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = location1.j; j <= location2.j; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (gBoard[i][j].isShown) continue
            var value
            var addClass
            countNegs(i, j)
            if (gBoard[i][j].isMine) {
                value = MINE
                addClass = 'mine'
            } else {
                addClass = 'shown'
                value = (gBoard[i][j].minesAroundCount > 0) ? gBoard[i][j].minesAroundCount : ''
            }
            if (gBoard[i][j].isMarked) {
                flags--
            }
            if (!isMegaHintOn) {
                renderCell(i, j, '', addClass)
                isMegaHintFinished = true
            } else renderCell(i, j, value, addClass)
        }
    }
}

function onMegaHint(elBtn) {
    isMegaHintOn = true
    elBtn.innerText = '0 Mega-Hints left'
}

function onManual(elBtn) {
    onInit(gLevel)
    isManualOn = true
    elBtn.innerText = `${gLevel.MINES} Left To Place`
    minePlacing()
}

function minePlacing() {
    elManualBtn.innerText = `${gLevel.MINES - minesPlaced} Left To Place`
    if (minesPlaced === gLevel.MINES) {
        isManualOn = false
    } else minesPlaced++
}