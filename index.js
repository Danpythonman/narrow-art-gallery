function chooseBestOption(options) {
    if (options.length == 1) {
        throw Error("Array is empty");
    }
    if (options.length == 1) {
        return 0;
    }
    let max = options[0];
    let maxIndex = 0;
    for (let i = 1; i < options.length; i++) {
        if (options[i] > max) {
            max = options[i];
            maxIndex = i;
        }
    }

    return { bestCost: max, bestOption: maxIndex };
}

/**
 * Solves the narrow art gallery problem with dynamic programming.
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 *
 * @returns {{ cost: Number, solution: Boolean[][] }} Solution the problem and its cost. In the solution array, if index (i, j) is true, it means close that room. If it is false, leave it open.
 */
function narrowArtGalleryDynamic(gallery, roomsToClose) {
    // We add 1 to the length of the gallery so that we can denote column 0 as 0
    // rooms left in the gallery.
    const n = gallery[0].length + 1;

    // We define:
    // 0 -> close no rooms
    // 1 -> close top room
    // 2 -> close bottom room
    const NONE = 0;
    const TOP = 1;
    const BOTTOM = 2;

    const OPTIONS = [NONE, TOP, BOTTOM];

    // This is the cost of a solution if it is invalid
    const INVALID_SOLUTION_COST = -Infinity;

    // n x r x 3 arrays to store cost and solution

    // Subinstances represent an art gallery length, a number of rooms still to
    // be closed, and the previous room that was closed.
    //
    // An example subinstance (4, 2, 1) represents the problem:
    //   "Close 2 rooms in a gallery of length 4 given that in the previous
    //    column of the gallery the top room was closed"
    const cost = Array(n).fill(0).map(() => Array(roomsToClose+1).fill(0).map(() => Array(3).fill(0)));
    const advice = Array(n).fill(0).map(() => Array(roomsToClose+1).fill(0).map(() => Array(3).fill(0)));

    // If we reach the end of the hall and have no rooms left to close (we
    // closed all the rooms we needed to), then the solution is valid and we
    // start with a cost of 0.
    cost[0][0][NONE] = 0;
    cost[0][0][TOP] = 0;
    cost[0][0][BOTTOM] = 0;
    advice[0][0][NONE] = NONE;
    advice[0][0][TOP] = NONE;
    advice[0][0][BOTTOM] = NONE;

    // If we reach the end of the hall and still have rooms left to close, then
    // the solution is invalid.
    for (let i = 1; i < roomsToClose; i++) {
        cost[0][i][NONE] = INVALID_SOLUTION_COST;
        cost[0][i][TOP] = INVALID_SOLUTION_COST;
        cost[0][i][BOTTOM] = INVALID_SOLUTION_COST;
        advice[0][i][NONE] = null;
        advice[0][i][TOP] = null;
        advice[0][i][BOTTOM] = null;
    }

    // Solve each subinstance
    for (let column = 1; column < n; column++) {
        for (let r = 1; r <= roomsToClose; r++) {
            for (const close of OPTIONS) {
                // The three options we can take:
                //   0 -> close no rooms
                //   1 -> close the  top room
                //   2 -> close the bottom room
                // All three options start as invalid until we decide otherwise
                const options = [
                    INVALID_SOLUTION_COST,
                    INVALID_SOLUTION_COST,
                    INVALID_SOLUTION_COST
                ];

                // Don't close any rooms - no change in cost
                options[NONE] = cost[column-1][r][NONE];

                // If we did not close the bottom room last and we still have
                // rooms to close, then we can close the top room
                if (close != BOTTOM && r > 0) {
                    options[TOP] = cost[column-1][r-1][TOP] + gallery[0][column-1];
                }

                // If we did not close the top room last and we still have rooms
                // to close, then we can close the bottom room
                if (close != TOP && r > 0) {
                    options[BOTTOM]= cost[column-1][r-1][BOTTOM] + gallery[1][column-1];
                }

                const { bestOption, bestCost } = chooseBestOption(options);

                // Advice tells us what door (if any) to close in this column
                advice[column][r][close] = bestOption;
                // And cost tells us what the cost of this decision is
                cost[column][r][close] = bestCost;
            }
        }
    }

    // At this point, the advice tells us which rooms to close throughout the
    // gallery. We need to iterate through the advice to build the full
    // solution.

    // True at index (i, j) means close room (i, j). False means keep it open.
    const solution = [Array(n-1).fill(false), Array(n-1).fill(false)];

    // Decide how we should start the solution (which door (if any) to close in
    // the first column)
    const {
        bestOption: start,
        bestCost: bestSolutionCost
    } = chooseBestOption(cost[n-1][roomsToClose-1]);

    let r = roomsToClose;
    let lastClosed = start;
    for (let i = n-1; i > 0; i--) {
        // Which room do we close at column `i` with `r` rooms left to close
        // given that we just closed `lastClosed`?
        let closeRoom = advice[i][r][lastClosed];

        if (closeRoom == TOP) {
            solution[0][i-1] = true;
            r--;
        } else if (closeRoom == BOTTOM) {
            solution[1][i-1] = true;
            r--;
        }
        lastClosed = closeRoom;
    }

    return { cost: bestSolutionCost, solution: solution };
}

/**
 * Solves the narrow art gallery problem with recursive backtracking (brute
 * force).
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} column The column of the art gallery we are currently considering.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 * @param {("top" | "bottom" | "none")} previouslyClosed Which room was previously closed.
 *
 * @returns {{ cost: Number, solution: Boolean[][] }} Solution to the current column and prior.
 */
function narrowArtGalleryRecursive(gallery, column, roomsToClose, previouslyClosed) {
    if (column == -1) {
        if (roomsToClose == 0) {
            return { cost: 0, solution: [Array(gallery[0].length), Array(gallery[1].length)] };
        } else {
            return { cost: -Infinity, solution: [Array(gallery[0].length), Array(gallery[1].length)] };
        }
    }

    // Close top room
    const solution1 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "top");
    solution1.solution[0][column] = true;
    solution1.solution[1][column] = false;
    if (previouslyClosed == "bottom" || roomsToClose == 0) {
        solution1.cost = -Infinity;
    } else {
        solution1.cost += gallery[0][column];
    }

    // Close bottom room
    const solution2 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "bottom");
    solution2.solution[0][column] = false;
    solution2.solution[1][column] = true;
    if (previouslyClosed == "top" || roomsToClose == 0) {
        solution2.cost = -Infinity;
    } else {
        solution2.cost += gallery[1][column];
    }

    // Close no rooms
    const solution3 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose, "none");
    solution3.solution[0][column] = false;
    solution3.solution[1][column] = false;

    let solution;
    if (solution1.cost > solution2.cost) {
        if (solution1.cost > solution3.cost) {
            solution = solution1;
        } else {
            solution = solution3;
        }
    } else {
        if (solution2.cost > solution3.cost) {
            solution = solution2;
        } else {
            solution = solution3;
        }
    }
    return solution;
}

/**
 * Gets the array representation of the input gallery where each entry of the
 * array represents the value of a room.
 *
 * @returns {Number[][]} The input gallery.
 */
function getInputGallery() {
    const table = document.getElementById("input-gallery");
    return gallery = Array.from(table.rows)
        .map(
            row => Array.from(row.cells)
                .map(
                    cell => parseInt(cell.innerText)
                )
        );
}

/**
 * Executes the narrow art gallery algorithms and displays their output tables.
 */
function startNarrowArtGallery() {
    const gallery = getInputGallery();

    const roomsToClose = parseInt(document.getElementById("roomsToClose").value);

    const solutionRecursive = narrowArtGalleryRecursive(gallery, gallery[0].length - 1, roomsToClose, "none");
    const solutionDynamic = narrowArtGalleryDynamic(gallery, roomsToClose);

    const recursiveBacktrackingSolutionDiv = document.getElementById("recursive-backtracking-solution");
    buildGalleryTable(
        gallery,
        recursiveBacktrackingSolutionDiv,
        "recursive-backtracking-solution-gallery",
        solutionRecursive.solution
    );

    const dynamicProgrammingSolutionDiv = document.getElementById("dynamic-programming-solution");
    buildGalleryTable(
        gallery,
        dynamicProgrammingSolutionDiv,
        "dynamic-programming-solution-gallery",
        solutionDynamic.solution
    );
}

/**
 * Displays the solution table for the narrow art gallery problem.
 *
 * Note that the div that the table is being appended to is cleared before the
 * table appended. So anything else in the div will be removed by this method.
 *
 * If the gallery solution is provided, rooms will be marked as closed and opened.
 *
 * @param {Number[][]} gallery The input gallery. Each entry represents the value of the room.
 * @param {HTMLDivElement} galleryParentDiv The div element that the table will be appended to.
 * @param {String} id The id to be given to the table element when it is created.
 * @param {Boolean[][]} gallerySolution The solution gallery. If an entry is `true`, it will be marked as closed. Otherwise, it is open.
 */
function buildGalleryTable(gallery, galleryParentDiv, id, gallerySolution = null) {
    const table = document.createElement("table");
    if (id != null) {
        table.id = id;
    }

    table.classList.add("gallery");

    for (const i in [0, 1]) {
        const tr = table.insertRow();
        for (let j = 0; j < gallery[i].length; j++) {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(gallery[i][j]));

            if (gallerySolution != null) {
                if (gallerySolution[i][j]) {
                    td.classList.add("close");
                } else {
                    td.classList.add("open")
                }
            }
        }
    }

    galleryParentDiv.innerHTML = "";
    galleryParentDiv.appendChild(table);
}

/**
 * Updates the input gallery based on the number of columns.
 *
 * Reads the value from the number of columns input and:
 * - if it is 0 or not a number, do nothing
 * - if it is larger than the current gallery, append rooms to the current
 *   gallery, all of which are valued at 0
 * - if it is smaller than the current gallery, remove the extra rooms from the
 *   current gallery.
 */
function updateInputGallery() {
    const numberOfColumns = parseInt(document.getElementById("numberOfColumns").value);

    if (isNaN(numberOfColumns) || numberOfColumns == 0) {
        return;
    }

    const gallery = getInputGallery();

    const newGallery = [Array(numberOfColumns), Array(numberOfColumns)];

    for (const i of [0, 1]) {
        for (let j = 0; j < numberOfColumns; j++) {
            if (j < gallery[0].length) {
                newGallery[i][j] = gallery[i][j];
            } else {
                newGallery[i][j] = 0;
            }
        }
    }

    const inputGalleryDiv = document.getElementById("input");
    buildGalleryTable(newGallery, inputGalleryDiv, "input-gallery");
}

/**
 * Randomizes the values of the input gallery. The value of each room in the
 * gallery will be a random integer from 0 to 10 (inclusive).
 */
function randomizeGalleryRoomValues() {
    const gallery = getInputGallery();
    const newGallery = gallery.map(row => row.map(() => Math.floor(Math.random() * 10)));
    const inputGalleryDiv = document.getElementById("input");
    buildGalleryTable(newGallery, inputGalleryDiv, "input-gallery");
}

document.getElementById("startButton").addEventListener("click", startNarrowArtGallery);
document.getElementById("numberOfColumns").addEventListener("input", updateInputGallery);
document.getElementById("randomizeButton").addEventListener("click", randomizeGalleryRoomValues);
