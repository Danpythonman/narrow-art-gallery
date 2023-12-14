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

    // Close top room
    let solution1;
    if (roomsToClose == 0) {
        solution1 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "top");
        solution1.solution[0][column] = true;
        solution1.solution[1][column] = false;
        solution1.cost = -Infinity;
    } else if (previouslyClosed == "bottom") {
        solution1 = { cost: -Infinity, solution: undefined };
    } else {
        solution1 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "top");
        solution1.solution[0][column] = true;
        solution1.solution[1][column] = false;
        solution1.cost += gallery[0][column];
    }

    // Close bottom room
    let solution2;
    if (roomsToClose == 0) {
        solution2 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "bottom");
        solution2.solution[0][column] = false;
        solution2.solution[1][column] = true;
        solution2.cost = -Infinity;
    } else if (previouslyClosed == "top") {
        solution2 = { cost: -Infinity, solution: undefined };
    } else {
        solution2 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose - 1, "bottom");
        solution2.solution[0][column] = false;
        solution2.solution[1][column] = true;
        solution2.cost += gallery[1][column];
    }

    // Close no rooms
    let solution3;
    solution3 = narrowArtGalleryRecursive(gallery, column - 1, roomsToClose, "none");
    solution3.solution[0][column] = false;
    solution3.solution[1][column] = false;

    console.group();
    console.log(`Column ${column}, roomsToClose ${roomsToClose}, previous: ${previouslyClosed}`);
    console.log(solution1);
    console.log(solution2);
    console.log(solution3);

    let solution;
    if (solution1.cost > solution2.cost) {
        if (solution1.cost > solution3.cost) {
            console.log("choosing 1");
            solution = solution1;
        } else {
            console.log("choosing 3");
            solution = solution3;
        }
    } else {
        if (solution2.cost > solution3.cost) {
            console.log("choosing 2");
            solution = solution2;
        } else {
            console.log("choosing 3");
            solution = solution3;
        }
    }
    console.groupEnd();
    return solution;
}

function startNarrowArtGallery() {
    table = document.getElementById("gallery");
    gallery = Array.from(table.rows)
        .map(
            row => Array.from(row.cells)
                .map(
                    cell => parseInt(cell.innerText)
                )
        );

    solution = narrowArtGalleryRecursive(gallery, gallery[0].length - 1, 6, "none");

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
