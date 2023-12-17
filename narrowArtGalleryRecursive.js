/**
 * Solves the narrow art gallery problem with recursive backtracking (brute
 * force).
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} column The column of the art gallery we are currently considering.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 * @param {("top" | "bottom" | "none")} previouslyClosed Which room was previously closed.
 *
 * @returns {{ cost: Number, solution: Boolean[][], duration: Number }} Solution to the current column and prior.
 */
function narrowArtGalleryRecursive(gallery, column, roomsToClose, previouslyClosed) {
    const startTime = Date.now();

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
            "none"
        );
        this.postMessage(solution);
    }
}
