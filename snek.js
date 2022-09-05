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

/**
 * Prototypes
 */
class Node {
    constructor ({ x, y }) {
        this.x = x;
        this.y = y;
        this.previous = null;
        this.next = null;
    }
}

class LinkedList {
    constructor (boardSize) {
        const smallerBoard = Math.sqrt(boardSize / 3);
        const coord = Math.floor(Math.random() * smallerBoard);
        const newNode = new Node({ x : coord, y : coord });

        this.head = newNode;
        this.tail = null;
        this.length = 1;
    }

    #getNextCoord (node) {
        const { x : prevX, y : prevY } = node.previous;
        const { x : currX, y : currY } = node;

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

    addToTail () {
        const formerTail = this.tail;

        if (!formerTail) {
            const newNode = new Node({ x : this.head.x, y : this.head.y + 1 });

            this.head.next = newNode;
            this.tail = newNode;
            this.tail.previous = this.head;
        } else {
            const newNode = new Node(this.#getNextCoord(formerTail));

            formerTail.next = newNode;
            newNode.previous = formerTail;

            this.tail = newNode;
        }

        this.length++;
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

    cells : []
});

/**
 * Helper functions
 */
/**
 * Say whether a cell is active or not
 * @param {number} idx - cell index
 * @param {string} type - fud | snek
 */
function toggleCellActivity ({ idx, x, y, type }) {
    const cell = idx ?
        document.querySelector(`[data-idx='${idx}']`) :
        document.querySelector(`[data-x='${x}'][data-y='${y}']`);

    if (!idx) {
        idx = cell.attributes["data-idx"].value;
    }

    const toggleTo = !state.cells[idx].active;
    const otherType = type === TYPES.fud ? TYPES.snek : TYPES.fud;

    cell.setAttribute("data-active", toggleTo);
    cell.setAttribute("data-type", toggleTo && type);

    state.cells[idx].active = toggleTo;
    state.cells[idx][type] = toggleTo;
    state.cells[idx][otherType] = false;
}

function getFudIdx () {
    const idx = Math.floor(Math.random() * state.boardSize);

    if (state.cells[idx].active) {
        return getFudIdx();
    }

    return idx;
}

function placeFud () {
    const idx = getFudIdx();

    // keep generating indeces until a valid one is found
    // do {
    //     idx = Math.floor(Math.random() * state.boardSize)
    // } while (typeof idx === "number" && !state.cells[idx].active);

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

/**
 *  Component creators
 */
function createLogo (parent = body) {
    const logo = $.createElement("h1");

    logo.innerText = "Snek";
    logo.classList.add("logo");

    parent.append(logo);
}

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

        state.cells.push({
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
        });
    }
}

/**
 * Event listeners
 */
window.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        placeFud();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    createLogo();
    createBoard();
    createSnek();
    placeFud();
});
