/**
 * Useful variables
 */
const $ = document;
const body = $.getElementsByTagName("body")[0];

const GRID_SIZES = {
    normal : 1764
};

const state = {

};

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
        cell.setAttribute("data-x", x);
        cell.setAttribute("data-y", y);

        board.append(cell);
    }

    parent.append(board);
}

/**
 * Execute
 */
createLogo();
createBoard();
