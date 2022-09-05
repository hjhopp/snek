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

    snek : {
        length : 4,
        posX   : null,
        posY   : null,
    },

    fud : {
        lastIdx : null
    },

    cells : []
};

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
    // bump board to the left so that the board is centered
    board.style.left = `calc(var(--cell-width) * ${-(rows / 2)})`;

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
            isFud    : false,
            isSnek   : false,
            isBorder : x === 0 ||
                y === 0 ||
                x === rows - 1 ||
                y === rows - 1
        });
    }

    parent.append(board);
}

/**
 * Event listeners
 */
 window.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        placeFud();
    }
});

/**
 * Execute
 */
createLogo();
createBoard();
placeFud();
