/**
 * Gets the best option and its index.
 *
 * @param {Number[]} options Array of options.
 * @param {Boolean} maximize If true then the maximum option is selected. Otherwise, the minimum option is selected.
 *
 * @returns The best option and its index.
 */
function chooseBestOption(options, maximize) {
    if (options.length == 1) {
        throw Error("Array is empty");
    }
    if (options.length == 1) {
        return 0;
    }

    let bestCost;
    let bestOption;

    if (maximize) {
        let max = options[0];
        let maxIndex = 0;
        for (let i = 1; i < options.length; i++) {
            if (options[i] > max) {
                max = options[i];
                maxIndex = i;
            }
        }
        bestCost = max;
        bestOption = maxIndex;
    } else {
        let min = options[0];
        let minIndex = 0;
        for (let i = 1; i < options.length; i++) {
            if (options[i] < min) {
                min = options[i];
                minIndex = i;
            }
        }
        bestCost = min;
        bestOption = minIndex;
    }

    return { bestCost: bestCost, bestOption: bestOption };
}

/**
 * Solves the narrow art gallery problem with dynamic programming.
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 * @param {Boolean} maximize If true, the solution is maximized. Otherwise, the solution is minimized.
 *
 * @returns {{ cost: Number, solution: Boolean[][], duration: Number }} Solution the problem, its cost, and its duration in milliseconds. In the solution array, if index (i, j) is true, it means close that room. If it is false, leave it open.
 */
function narrowArtGalleryDynamic(gallery, roomsToClose, maximize = true) {
    const startTime = Date.now();

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
    const INVALID_SOLUTION_COST = maximize ? -Infinity : Infinity;

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
    for (let i = 1; i < roomsToClose+1; i++) {
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

                const { bestOption, bestCost } = chooseBestOption(options, maximize);

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
    } = chooseBestOption(cost[n-1][roomsToClose-1], maximize);

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

    const endTime = Date.now();

    return { cost: bestSolutionCost, solution: solution, duration: endTime - startTime };
}

onmessage = function (event) {
    if (event.data && event.data.type && event.data.type == "narrowArtGallery") {
        const solution = narrowArtGalleryDynamic(
            event.data.gallery,
            event.data.roomsToClose,
            event.data.maximize
        );
        this.postMessage(solution);
    }
}
