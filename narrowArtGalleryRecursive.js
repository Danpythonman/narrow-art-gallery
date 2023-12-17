/**
 * Chooses the best solution.
 *
 * @param {{ cost: Number, solution: Boolean[][], duration: Number }[]} solutions Array of three solutions.
 * @param {Boolean} maximize If true then the solution with the maximum cost is selected. Otherwise, the solution with the minimum cost is selected.
 *
 * @returns { cost: Number, solution: Boolean[][], duration: Number } The best solution.
 */
function chooseBestOption(solutions, maximize) {
    if (maximize) {
        if (solutions[0].cost > solutions[1].cost) {
            if (solutions[0].cost > solutions[2].cost) {
                return solutions[0];
            } else {
                return solutions[2];
            }
        } else {
            if (solutions[1].cost > solutions[2].cost) {
                return solutions[1];
            } else {
                return solutions[2];
            }
        }
    } else {
        if (solutions[0].cost < solutions[1].cost) {
            if (solutions[0].cost < solutions[2].cost) {
                return solutions[0];
            } else {
                return solutions[2];
            }
        } else {
            if (solutions[1].cost < solutions[2].cost) {
                return solutions[1];
            } else {
                return solutions[2];
            }
        }
    }
}

/**
 * Solves the narrow art gallery problem with recursive backtracking (brute
 * force).
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} column The column of the art gallery we are currently considering.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 * @param {("top" | "bottom" | "none")} previouslyClosed Which room was previously closed.
 * @param {Boolean} maximize If true, the solution is maximized. Otherwise, the solution is minimized.
 *
 * @returns {{ cost: Number, solution: Boolean[][], duration: Number }} Solution to the current column and prior.
 */
function narrowArtGalleryRecursive(gallery, column, roomsToClose, previouslyClosed, maximize = true) {
    const startTime = Date.now();

    // This is the cost of a solution if it is invalid
    const INVALID_SOLUTION_COST = maximize ? -Infinity : Infinity;

    if (column == -1) {
        if (roomsToClose == 0) {
            return { cost: 0, solution: [Array(gallery[0].length), Array(gallery[1].length)] };
        } else {
            return { cost: INVALID_SOLUTION_COST, solution: [Array(gallery[0].length), Array(gallery[1].length)] };
        }
    }

    // Close top room
    const solution1 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "top", maximize);
    solution1.solution[0][column] = true;
    solution1.solution[1][column] = false;
    if (previouslyClosed == "bottom" || roomsToClose == 0) {
        solution1.cost = INVALID_SOLUTION_COST;
    } else {
        solution1.cost += gallery[0][column];
    }

    // Close bottom room
    const solution2 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "bottom", maximize);
    solution2.solution[0][column] = false;
    solution2.solution[1][column] = true;
    if (previouslyClosed == "top" || roomsToClose == 0) {
        solution2.cost = INVALID_SOLUTION_COST;
    } else {
        solution2.cost += gallery[1][column];
    }

    // Close no rooms
    const solution3 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose, "none", maximize);
    solution3.solution[0][column] = false;
    solution3.solution[1][column] = false;

    const solution = chooseBestOption([solution1, solution2, solution3], maximize);

    const endTime = Date.now();
    solution.duration = endTime - startTime;

    return solution;
}

onmessage = function (event) {
    if (event.data && event.data.type && event.data.type == "narrowArtGallery") {
        const solution = narrowArtGalleryRecursive(
            event.data.gallery,
            event.data.gallery[0].length - 1,
            event.data.roomsToClose,
            "none",
            event.data.maximize
        );
        this.postMessage(solution);
    }
}
