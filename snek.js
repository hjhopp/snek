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
    fudfound  : "fudfound"
};

const EVENTS = {
    snekmoved : new Event(EVENT_NAMES.snekmoved),
    fudfound  : new Event(EVENT_NAMES.fudfound)
};

/**
 * Prototypes
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

    #getNextCoord () {
        let { prevX, prevY } = this.currentNode.previous;
        const { x : currX, y : currY } = this.currentNode;

        // going up
        if (prevY < currY) {
            return {
                x : currX,
                y : currY + 1
            };
        }

        // going down
        if (prevY > currY) {
            return {
                x : currX,
                y : currY - 1
            };
        }

        // going right
        if (prevX < currX) {
            return {
                x : currX + 1,
                y : currY
            };
        }

        // going left
        return {
            x : currX - 1,
            y : currY
        };
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

        this.#toggleNodeDisplay()
            .#savePreviousCoords()
            .#saveCurrentCoords({ x : nextX, y : nextY })
            .#toggleNodeDisplay();

        return true;
    }

    #updateTail () {
        this.currentNode = this.head.next;

        while (this.currentNode.next) {
            this.#toggleNodeDisplay()
                .#savePreviousCoords()
                .#saveCurrentCoords({
                    x : this.currentNode.previous.prevX,
                    y : this.currentNode.previous.prevY
                })
                .#toggleNodeDisplay();

            this.currentNode = this.currentNode.next;
        }

        // get the last node
        this.currentNode = this.tail;

        this.#toggleNodeDisplay()
            .#savePreviousCoords()
            .#saveCurrentCoords({
                x : this.currentNode.previous.prevX,
                y : this.currentNode.previous.prevY
            })
            .#toggleNodeDisplay();
    }

    #toggleNodeDisplay () {
        toggleCellActivity({ x : this.currentNode.x, y : this.currentNode.y, type : TYPES.snek });

        return this;
    }

    #savePreviousCoords () {
        this.currentNode.prevX = this.currentNode.x;
        this.currentNode.prevY = this.currentNode.y;

        return this;
    }

    #saveCurrentCoords (coords) {
        this.currentNode.x = coords.x;
        this.currentNode.y = coords.y;

        return this;
    }

    addToTail () {
        this.currentNode = this.tail;

        // if no node, we only have a head, so add the second node
        // else add to the tail
        if (!this.currentNode) {
            const newNode = new Node({ x : this.head.x, y : this.head.y + 1 });

            this.head.next = newNode;
            this.tail = newNode;
            this.tail.previous = this.head;
        } else {
            const newNode = new Node(this.#getNextCoord());

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

        // window.dispatchEvent(EVENTS.snekmoved);
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
    boardSize : GRID_SIZES.normal,

    snek : null,

    fud : {
        lastIdx : null
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
    ]
});

function createCell ({ active, idx, x, y, fud, snek, isBorder }) {
    return Object.seal({
        active,
        idx,
        x,
        y,
        fud,
        snek,
        isBorder
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
 * Controls
 */


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
            active   : false,
            idx      : i,
            x,
            y,
            fud      : false,
            snek     : false,
            isBorder : x === 0 ||
                y === 0 ||
                x === rows - 1 ||
                y === rows - 1
        }));
    }
}

function placeFud () {
    const idx = getFudIdx();

    if (state.fud.lastIdx) {
        // turn off old cell
        toggleCellActivity({ idx : state.fud.lastIdx, type : TYPES.fud });
    }

    // turn on new cell
    toggleCellActivity({ idx, type : TYPES.fud });

    state.fud.lastIdx = idx;
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

        state.snek.addToTail();
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
window.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        placeFud();
    }

    switch (e.key) {
        case "ArrowUp":
            state.snek.move(DIRECTIONS.up);
            break;
        case "ArrowDown":
            state.snek.move(DIRECTIONS.down);
            break;
        case "ArrowLeft":
            state.snek.move(DIRECTIONS.left);
            break;
        default:
            state.snek.move(DIRECTIONS.right);
            break;
    }
});

window.addEventListener(EVENT_NAMES.snekmoved, () => {

});

createLogo();
createBoard();
createSnek();
placeFud();
