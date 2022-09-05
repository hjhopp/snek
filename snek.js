/**
 * Useful variables
 */
const $ = document;
const body = $.getElementsByTagName("body")[0];

const GRID_SIZES = {
    normal : 1764
};

const TYPES = {
    snek : "snek",
    fud  : "fud"
};

const state = {
    boardSize : GRID_SIZES.normal,
    rows      : Math.sqrt(this.boardSize),

    snek : {
        length : 4,
        nodes  : [],
        node   : {
            isHead   : false,
            isTail   : false,
            posX     : null,
            posY     : null,
            nextNode : null,
            prevNode : null
        }
    },

    fud : {
        lastIdx : null
    },

    cells : []
};

class Node {
    constructor ({ x, y }) {
        this.x = x;
        this.y = y;
        this.previous = null;
        this.next = null;
    }
}

class LinkedList {
    constructor () {
        const newNode = new Node({ x : state.rows / 2, y : state.rows / 2 });

        this.head = newNode;
        this.tail = newNode;
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
        const firstAddition = !this.tail.previous;
        const formerTail = this.tail;

        if (firstAddition) {
            const newNode = new Node({ x : this.head.x, y : this.head.y + 1 });

            this.head.next = newNode;
            this.tail = newNode;
            this.tail.previous = this.head;
        } else {
            const newNode = new Node({});

            newNode.previous = formerTail;
        }
    }
}

/**
 * Helper functions
 */
/**
 * Say whether a cell is active or not
 * @param {number} idx - cell index
 * @param {string} type - fud | snek
 */
function toggleCellActivity (idx, type) {
    const cell = document.querySelector(`[data-idx='${idx}']`);
    const toggleTo = !state.cells[idx].active;
    const otherType = type === TYPES.fud ? TYPES.snek : TYPES.fud;

    cell.setAttribute("data-active", toggleTo);
    cell.setAttribute("data-type", toggleTo && type);

    state.cells[idx].active = toggleTo;
    state.cells[idx][type] = toggleTo;
    state.cells[idx][otherType] = false;
}

function placeFud () {
    const idx = Math.floor(Math.random() * state.boardSize);

    if (state.fud.lastIdx) {
        // turn off old cell
        toggleCellActivity(state.fud.lastIdx, TYPES.fud);
    }

    // turn on new cell
    toggleCellActivity(idx, TYPES.fud);

    state.fud.lastIdx = idx;
}

function createSnek () {
    for (let i = 0; i < state.snek.length; i++) {
        const node = { ...state.snek.node };

        if (i === 0) {
            node.isHead = true;
        }
    }
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
    placeFud();
});
