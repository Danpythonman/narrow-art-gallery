/**
 * Narrow art gallery problem.
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

    const solutions = [];

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

function startNarrowArtGallery() {
    const table = document.getElementById("gallery");
    const gallery = Array.from(table.rows)
        .map(
            row => Array.from(row.cells)
                .map(
                    cell => parseInt(cell.innerText)
                )
        );

    const roomsToClose = parseInt(document.getElementById("roomsToClose").value);

    const solution = narrowArtGalleryRecursive(gallery, gallery[0].length - 1, roomsToClose, "none");

    console.log(solution);

    buildSolutionTable(gallery, solution.solution);
}

function buildSolutionTable(galleryInput, gallerySolution) {
    const solutionDiv = document.getElementById("solution");
    const table = document.createElement("table");
    for (const i in [0, 1]) {
        const tr = table.insertRow();
        for (let j = 0; j < galleryInput[i].length; j++) {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(galleryInput[i][j]));
            if (gallerySolution[i][j]) {
                td.classList.add("close");
            } else {
                td.classList.add("open")
            }
        }
    }
    solutionDiv.appendChild(table);
}

document.getElementById("startButton").addEventListener("click", startNarrowArtGallery);
