function maxAndIndex(arr) {
    if (arr.length == 1) {
        throw Error("Array is empty");
    }
    if (arr.length == 1) {
        return 0;
    }
    let max = arr[0];
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            maxIndex = i;
        }
    }

    return { value: max, index: maxIndex };
}

function narrowArtGalleryDynamic(gallery, roomsToClose) {
    // We add 1 to the length of the gallery so that we can denote column 0 as 0
    // rooms left in the gallery.
    const n = gallery[0].length + 1;

    // n x r x 3 arrays to store cost and solution

    // Subinstances represent an art gallery length, a number of rooms still to
    // be closed, and the previous room that was closed.
    //
    // An example subinstance (4, 2, 1) represents the problem:
    //   "Close 2 rooms in a gallery of length 4 given that in the previous
    //    column of the gallery the top room was closed"
    const cost = Array(n).fill(0).map(() => Array(roomsToClose+1).fill(0).map(() => Array(3).fill(0)));
    const advice = Array(n).fill(0).map(() => Array(roomsToClose+1).fill(0).map(() => Array(3).fill(0)));

    // We define:
    // 0 -> close no rooms
    // 1 -> close top room
    // 2 -> close bottom room

    // If we reach the end of the hall and have no rooms left to close (we
    // closed all the rooms we needed to), then the solution is valid and we
    // start with a cost of 0. We close no rooms because we have no rooms left
    // to close.
    cost[0][0][0] = 0;
    advice[0][0][0] = 0;
    cost[0][0][1] = 0;
    cost[0][0][2] = 0;
    advice[0][0][1] = 0;
    advice[0][0][2] = 0;
    // We cannot close any rooms if there are none left to close, so these are
    // invalid.
    // cost[0][0][1] = -Infinity;
    // cost[0][0][2] = -Infinity;
    // advice[0][0][1] = null;
    // advice[0][0][2] = null;

    // If we reach the end of the hall and still have rooms left to close, then
    // the solution is invalid.
    for (let i = 1; i < roomsToClose; i++) {
        cost[0][i][0] = -Infinity;
        cost[0][i][1] = -Infinity;
        cost[0][i][2] = -Infinity;
        advice[0][i][0] = null;
        advice[0][i][1] = null;
        advice[0][i][2] = null;
    }

    // Solve each subinstance
    for (let column = 1; column < n; column++) {
        for (let r = 1; r <= roomsToClose; r++) {
            for (let close = 0; close < 3; close++) {
                let topCost;
                if (close == 2 || r == 0) {
                    topCost = -Infinity;
                } else {
                    topCost = cost[column-1][r-1][1] + gallery[0][column-1];
                }

                let botCost;
                if (close == 1 || r == 0) {
                    botCost = -Infinity;
                } else {
                    botCost = cost[column-1][r-1][2] + gallery[1][column-1];
                }

                let noneCost = cost[column-1][r][0];

                let bestCost;
                let bestAdvice;
                if (topCost > botCost) {
                    if (topCost > noneCost) {
                        bestCost = topCost;
                        bestAdvice = 1;
                    } else {
                        bestCost = noneCost;
                        bestAdvice = 0;
                    }
                } else {
                    if (botCost > noneCost) {
                        bestCost = botCost;
                        bestAdvice = 2;
                    } else {
                        bestCost = noneCost;
                        bestAdvice = 0;
                    }
                }
                console.group();
                console.log(`col: ${column}, Gallery top: ${gallery[0][column]}, Gallery bot: ${gallery[1][column]}`);
                console.log(`Column: ${column}, r: ${r}, lastClosed: ${close}`);
                console.log(`Top: ${topCost}, Bot: ${botCost}, None: ${noneCost}`);
                console.log(`Best cost: ${bestCost}`);
                console.log(`Best advice: ${bestAdvice}`);
                console.groupEnd();
                cost[column][r][close] = bestOptionCost;
                advice[column][r][close] = bestOption;
            }
        }
    }

    const c1 = cost[n-1][roomsToClose-1][1];
    const c2 = cost[n-1][roomsToClose-1][2];
    const c3 = cost[n-1][roomsToClose-1][0];

    let start;
    if (c1 > c2) {
        if (c1 > c3) {
            start = 1;
        } else {
            start = 0;
        }
    } else {
        if (c2 > c3) {
            start = 2;
        } else {
            start = 0;
        }
    }

    const solution = [Array(n-1).fill(false), Array(n-1).fill(false)];
    console.log(advice);

    let r = roomsToClose;
    let lastClosed = start;
    console.log(`Starting at ${start}`);
    console.group();
    for (let i = n-1; i > 0; i--) {
        let closeRoom = advice[i][r][lastClosed];
        console.log(`i: ${i}, r: ${r}, last: ${lastClosed}, DO THIS: ${closeRoom}`);
        if (closeRoom == 1) {
            solution[0][i-1] = true;
            r--;
        } else if (closeRoom == 2) {
            solution[1][i-1] = true;
            r--;
        }
        lastClosed = closeRoom;
    }
    console.groupEnd();

    return solution;
}

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

    const solutionRecursive = narrowArtGalleryRecursive(gallery, gallery[0].length - 1, roomsToClose, "none");
    const solutionDynamic = narrowArtGalleryDynamic(gallery, roomsToClose);

    console.group();
    console.log(solutionRecursive);
    console.log(solutionDynamic);
    console.groupEnd();

    document.getElementById("solution1").innerHTML = "";
    document.getElementById("solution2").innerHTML = "";
    buildSolutionTable(gallery, solutionRecursive.solution, 1);
    buildSolutionTable(gallery, solutionDynamic, 2);
}

function buildSolutionTable(galleryInput, gallerySolution, i) {
    const solutionDiv = i == 1 ? document.getElementById("solution1") : document.getElementById("solution2");
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
