"use strict";

/**
 * Constants
 */
const GRID_SIZES = {
    normal : 1764
};

const TYPES = {
    snek : "snek",
    fud  : "fud"
};

const STARTING_SNEK_SIZE = 4;

const DIRECTIONS = {
    up    : "up",
    down  : "down",
    left  : "left",
    right : "right"
};

const EVENT_NAMES = {
    snekmoved : "snekmoved",
    fudfound  : "fudfound",
    gameover  : "gameover"
};

const EVENTS = {
    snekmoved : new Event(EVENT_NAMES.snekmoved),
    fudfound  : new Event(EVENT_NAMES.fudfound),
    gameover  : new Event(EVENT_NAMES.gameover)
};

/**
 * Prototypes
 */
/**
 * A node in a list
 * @typedef Node
 */
class Node {
    constructor ({ x, y }) {
        // coordinates
        this.prevX = null;
        this.prevY = null;
        this.x = x;
        this.y = y;

        // previous/next node in the list
        this.previous = null;
        this.next = null;
    }
}

class LinkedList {
    constructor (boardSize) {
        // make a smaller range of random numbers to choose from so snek always lands on the board
        // this is pretty handwavey, whatevs
        const smallerBoard = Math.sqrt(boardSize / 3);
        const coord = Math.floor(Math.random() * smallerBoard);
        const newNode = new Node({ x : coord, y : coord });

        this.head = newNode;
        this.tail = null;
        this.length = 1;

        this.currentNode = null;
    }

    /**
     * Get the next coordinates of the current node by looking at the previous node and itself
     * @param {boolean} [opts.stationary=false] - only true when the snek is first created
     * @returns {object} x, y coordinates
     */
    #getNextTailCoord ({ stationary = false } = {}) {
        let { prevX, prevY } = stationary ? this.currentNode.previous : this.currentNode;
        const { x : currX, y : currY } = this.currentNode;

        // going up
        if (prevY < currY) {
            return {
                x : currX,
                y : stationary ? currY + 1 : currY - 1
            };
        }

        // going down
        if (prevY > currY) {
            return {
                x : currX,
                y : stationary ? currY - 1 : currY + 1
            };
        }

        // going right
        if (prevX < currX) {
            return {
                x : stationary ? currX + 1 : currX - 1,
                y : currY
            };
        }

        // going left
        if (prevX > currX) {
            return {
                x : stationary ? currX - 1 : currX + 1,
                y : currY
            };
        }
    }

    /**
     * Update the position of the head
     * @param {string} direction
     * @returns {boolean} true if updated, false if not
     */
    #updateHead (direction) {
        this.currentNode = this.head;

        let nextX = this.head.x;
        let nextY = this.head.y;
        let compareY = true;

        switch (direction) {
            case DIRECTIONS.up: {
                nextY = this.head.y - 1;

                break;
            }
            case DIRECTIONS.down: {
                nextY = this.head.y + 1;

                break;
            }
            case DIRECTIONS.left: {
                nextX = this.head.x - 1;
                compareY = false;

                break;
            }
            default: {
                nextX = this.head.x + 1;
                compareY = false;

                break;
            }
        }

        // can't go up if we were going down
        // can't go down if we were going up, etc
        if (compareY ?
            nextY === this.head.next.y :
            nextX === this.head.next.x
        ) {
            return false;
        }

        this.#moveNode({ x : nextX, y : nextY });

        return true;
    }

    /**
     * Update the position of all the tail nodes
     */
    #updateTail (currentNode = this.head.next) {
        this.currentNode = currentNode;

        this.#moveNode({
            x : this.currentNode.previous.prevX,
            y : this.currentNode.previous.prevY
        });

        if (this.currentNode.next) {
            this.#updateTail(this.currentNode.next);
        }
    }

    #moveNode ({ x, y }) {
        this.#savePreviousCoords()
            .#saveNextCoords({ x, y });
    }

    #savePreviousCoords () {
        this.currentNode.prevX = this.currentNode.x;
        this.currentNode.prevY = this.currentNode.y;

        return this;
    }

    #saveNextCoords (coords) {
        this.currentNode.x = coords.x;
        this.currentNode.y = coords.y;

        return this;
    }

    /**
     * Adds a node to the list
     * @param {boolean} [opts.stationary=false] - only true when first creating the snek
     */
    addNodeToTail ({ stationary = false } = {}) {
        this.currentNode = this.tail;

        // if no node, we only have a head, so add the second node
        // else add to the end of the tail
        if (!this.currentNode) {
            const newNode = new Node({ x : this.head.x, y : this.head.y + 1 });

            this.head.next = newNode;
            this.tail = newNode;
            this.tail.previous = this.head;
        } else {
            const newNode = new Node(this.#getNextTailCoord({ stationary }));

            this.currentNode.next = newNode;
            newNode.previous = this.currentNode;

            this.tail = newNode;
        }

        this.length++;
    }

    move (direction = DIRECTIONS.up) {
        const update = this.#updateHead(direction);

        if (!update) {
            return;
        }

        this.#updateTail();

        window.dispatchEvent(EVENTS.snekmoved);
    }

    /* eslint-disable callback-return */
    forEach (cb, currentNode = this.head) {
        cb(currentNode);

        if (currentNode.next) {
            this.forEach(cb, currentNode.next);
        }
    }

    /**
     * Loop through list until callback returns true
     * @param {function} cb
     * @param {Node} currentNode
     * @returns
     */
    some (cb, currentNode = this.head) {
        if (!currentNode) {
            return false;
        }

        const result = cb(currentNode);

        if (!currentNode.next) {
            return result;
        }

        return result || this.some(cb, currentNode.next);
    }
}

/**
 * Useful variables
 */
const $ = document;
const body = $.getElementsByTagName("body")[0];

/**
 * State
 */
// Sealing so I'm forced to add properties I want on state here and not buried elsewhere
const state = Object.seal({
    gameId    : null,
    boardSize : GRID_SIZES.normal,

    moveDirection : DIRECTIONS.up,

    snek : null,

    fud : {
        idx : null
    },

    // every cell has its own state
    cells : [
        /**
         * {
                active   : {boolean},
                idx      : {number},
                x        : {number},
                y        : {number},
                fud      : {boolean},
                snek     : {boolean},
                isBorder : {boolean}
            }
         */
    ],

    gameoverIdx : null,

    gameover : false
});

function createCell ({ active, idx, x, y, fud, snek, leftBorder, rightBorder }) {
    return Object.seal({
        active,
        idx,
        x,
        y,
        fud,
        snek,
        leftBorder,
        rightBorder,
        borderCrossed : false
    });
}

/**
 * Helper functions
 */
/**
 * Say whether a cell is active or not
 * @param {number} opts.idx - cell index
 * @param {number} opts.x - x coordinate
 * @param {number} opts.y - y coordinate
 * @param {string} type - fud | snek
 */
function toggleCellActivity ({ x, y, idx = coordsToIdx(x, y), type }) {
    const cell = document.querySelector(`[data-idx='${idx}']`);
    const toggleTo = !state.cells[idx].active;
    const otherType = type === TYPES.fud ? TYPES.snek : TYPES.fud;

    cell.setAttribute("data-active", toggleTo);
    cell.setAttribute("data-type", toggleTo && type);

    state.cells[idx].active = toggleTo;
    state.cells[idx][type] = toggleTo;
    state.cells[idx][otherType] = false;
}

/**
 * Get a new index for the fud. Recurse and make a new one if cell is unavailable.
 * @returns {number} idx
 */
function getFudIdx () {
    const idx = Math.floor(Math.random() * state.boardSize);

    if (state.cells[idx].active) {
        return getFudIdx();
    }

    return idx;
}

/**
 * Check if snek head is hitting body
 * @returns {boolean}
 */
function checkBodyCollision () {
    const headCoords = coordsToIdx(state.snek.head.x, state.snek.head.y);

    return state.snek.some((node) => {
        const nodeCoords = coordsToIdx(node.x, node.y);

        return headCoords === nodeCoords;
    }, state.snek.head.next);
}

/**
 * Check and set a flag if snek is about the cross a border
 */
function setBorderCrossingFlag () {
    const snekHeadIdx = coordsToIdx(state.snek.head.x, state.snek.head.y);
    const cell = state.cells[snekHeadIdx];

    if (cell.rightBorder) {
        state.gameoverIdx = snekHeadIdx + 1;
    } else if (cell.leftBorder) {
        state.gameoverIdx = snekHeadIdx - 1;
    } else {
        state.gameoverIdx = null;
    }
}

function checkBorderCrossing () {
    const snekHeadIdx = coordsToIdx(state.snek.head.x, state.snek.head.y);

    // if we cross the top or bottom
    if (!state.cells[snekHeadIdx]) {
        return true;
    }

    // if we cross the left or right border
    if (snekHeadIdx === state.gameoverIdx) {
        return true;
    }
}

function tick () {
    state.snek.move(state.moveDirection);
}

/**
 *  Component creators
 */
/**
 * Create and display the logo
 * @param {HTMLElement} parent
 */
function createLogo (parent = body) {
    const logo = $.createElement("h1");

    logo.innerText = "Snek";
    logo.classList.add("logo");

    parent.append(logo);
}

/**
 * Create and display the game baord. The origin (0,0) is the top left corner.
 * @param {HTMLElement} parent
 * @param {number} gridSize - must have a square root
 */
function createBoard (parent = body, gridSize = GRID_SIZES.normal) {
    const board = $.createElement("div");
    const rows = Math.sqrt(gridSize);
    let row = 0;

    board.classList.add("board");
    board.style.width = `calc(${rows} * var(--cell-width))`;
    board.style.height = `calc(${rows} * var(--cell-width))`;

    parent.append(board);

    for (let i = 0; i < gridSize; i++) {
        if (i % rows === 0 && i !== 0) {
            row++;
        }

        const cell = $.createElement("div");

        const x = i - row * rows;
        const y = row;

        cell.classList.add("cell");
        cell.style.left = `calc(${x} * var(--cell-width))`;
        cell.style.top = `calc(${y} * var(--cell-width))`;

        cell.setAttribute("data-active", false);
        cell.setAttribute("data-idx", i);
        cell.setAttribute("data-x", x);
        cell.setAttribute("data-y", y);

        board.append(cell);

        state.cells.push(createCell({
            active      : false,
            idx         : i,
            x,
            y,
            fud         : false,
            snek        : false,
            leftBorder  : x === 0,
            rightBorder : x === rows - 1
        }));
    }
}

/**
 * Create the gameover menu
 */
function createGameOverMenu () {
    const overlay = $.createElement("div");
    const text = $.createElement("h2");
    const newGame = $.createElement("button");

    text.innerText = "Game Over";
    newGame.innerText = "New Game";

    overlay.appendChild(text);
    overlay.appendChild(newGame);

    overlay.classList.add("gameover");
    overlay.setAttribute("data-status", false);

    body.appendChild(overlay);
}

function placeFud ({ eaten = false } = {}) {
    const idx = getFudIdx();

    if (state.fud.idx && !eaten) {
        // turn off old cell
        toggleCellActivity({ idx : state.fud.idx, type : TYPES.fud });
    }

    // turn on new cell
    toggleCellActivity({ idx, type : TYPES.fud });

    state.fud.idx = idx;
}

function createSnek () {
    if (!state.snek) {
        state.snek = new LinkedList(state.boardSize);
    }

    while (state.snek.length < STARTING_SNEK_SIZE) {
        const nodeToAddToBoard = state.snek.tail || state.snek.head;

        toggleCellActivity({
            x    : nodeToAddToBoard.x,
            y    : nodeToAddToBoard.y,
            type : TYPES.snek
        });

        state.snek.addNodeToTail({ stationary : true });
    }

    // get the last one
    toggleCellActivity({
        x    : state.snek.tail.x,
        y    : state.snek.tail.y,
        type : TYPES.snek
    });
}

function coordsToIdx (x, y) {
    const rows = Math.sqrt(state.boardSize);

    return (rows * y) + x;
}

/**
 * Event listeners
 */
/* eslint-disable complexity */
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "W":
        case "w":
            if (state.moveDirection !== DIRECTIONS.down) {
                state.moveDirection = DIRECTIONS.up;
            }

            break;
        case "ArrowDown":
        case "S":
        case "s":
            if (state.moveDirection !== DIRECTIONS.up) {
                state.moveDirection = DIRECTIONS.down;
            }

            break;
        case "ArrowLeft":
        case "A":
        case "a":
            if (state.moveDirection !== DIRECTIONS.right) {
                state.moveDirection = DIRECTIONS.left;
            }

            break;
        case "ArrowRight":
        case "D":
        case "d":
            if (state.moveDirection !== DIRECTIONS.left) {
                state.moveDirection = DIRECTIONS.right;
            }

            break;
        default:
            break;
    }
});

window.addEventListener(EVENT_NAMES.snekmoved, () => {
    const snekHeadIdx = coordsToIdx(state.snek.head.x, state.snek.head.y);
    const shouldUpdate = !checkBodyCollision() && !checkBorderCrossing();

    if (!shouldUpdate) {
        return window.dispatchEvent(EVENTS.gameover);
    }

    state.snek.forEach((node) => {
        // turn off old cell
        toggleCellActivity({ x : node.prevX, y : node.prevY, type : TYPES.snek });

        // turn on new cell
        toggleCellActivity({ x : node.x, y : node.y, type : TYPES.snek });
    });

    if (snekHeadIdx === state.fud.idx) {
        // turn the head back on, since the overlap turned it off
        toggleCellActivity({ x : state.snek.head.x, y : state.snek.head.y, type : TYPES.snek });

        state.snek.addNodeToTail();

        // turn the new tail on
        toggleCellActivity({ x : state.snek.tail.x, y : state.snek.tail.y, type : TYPES.snek });

        window.dispatchEvent(EVENTS.fudfound);
    }

    setBorderCrossingFlag();
});

window.addEventListener(EVENT_NAMES.fudfound, () => {
    // move fud somewhere new
    placeFud({ eaten : true });
});

window.addEventListener(EVENT_NAMES.gameover, () => {
    clearInterval(state.gameId);

    $.getElementsByClassName("gameover")[0].setAttribute("data-status", true);
});

/**
 * Init
 */
createLogo();
createBoard();
createGameOverMenu();
createSnek();
placeFud();

state.gameId = setInterval(() => tick(), 150);
