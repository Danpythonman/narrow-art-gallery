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
                    cell => parseInt(cell.querySelector("input").value)
                )
        );
}

/**
 * Solves the narrow art gallery problem using a webworker. The result of the
 * webworker is returned as a promise so that it can be used with async/await.
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 * @param {Boolean} useDynamicProgramming If true, dynamic programming will be used. Otherwise, recursive backtracking will be used.
 * @param {Boolean} maximize If true, the solution is maximized. Otherwise, the solution is minimized.
 *
 * @returns {Promise<{ cost: Number, solution: Boolean[][], duration: Number }>} Solution the problem, its cost, and its duration in milliseconds. In the solution array, if index (i, j) is true, it means close that room. If it is false, leave it open.
 */
function dispatchArtGalleryToWebWorker(gallery, roomsToClose, usedDynamicProgramming, maximize) {
    return new Promise((resolve) => {
        const algorithmFile = usedDynamicProgramming
            ? "narrowArtGalleryDynamic.js"
            : "narrowArtGalleryRecursive.js";
        const worker = new Worker(algorithmFile);

        worker.postMessage({ type: "narrowArtGallery", gallery: gallery, roomsToClose: roomsToClose, maximize: maximize });

        worker.onmessage = function (event) {
            worker.terminate();
            resolve(event.data);
        }
    });
}

/**
 * Chooses an algorithm to solve the narrow art gallery problem and solves it.
 *
 * @param {Number[][]} gallery The array representing the art gallery.
 * @param {Number} roomsToClose The number of rooms we have left to close.
 * @param {Boolean} useDynamicProgramming If true, dynamic programming will be used. Otherwise, recursive backtracking will be used.
 * @param {Boolean} maximize If true, the solution is maximized. Otherwise, the solution is minimized.
 *
 * @returns {Promise<{ cost: Number, solution: Boolean[][], duration: Number }>} Solution the problem, its cost, and its duration in milliseconds. In the solution array, if index (i, j) is true, it means close that room. If it is false, leave it open.
 */
async function startArtGallery(gallery, roomsToClose, useDynamicProgramming, maximize) {
    if (window.Worker) {
        return await dispatchArtGalleryToWebWorker(gallery, roomsToClose, useDynamicProgramming, maximize);
    } else {
        if (useDynamicProgramming) {
            return solutionDynamic = narrowArtGalleryDynamic(gallery, roomsToClose, maximize);
        } else {
            return solutionRecursive = narrowArtGalleryRecursive(gallery, gallery[0].length - 1, roomsToClose, "none", maximize);
        }
    }
}

/**
 * Executes the narrow art gallery algorithms and displays their output tables.
 */
async function startNarrowArtGallery() {
    const gallery = getInputGallery();

    const roomsToCloseInput = document.getElementById("rooms-to-close");
    let roomsToClose = parseInt(roomsToCloseInput.value);

    if (isNaN(roomsToClose)) {
        roomsToClose = parseInt(prompt("You didn't enter the number of rooms to close! You can enter it here:", ""));
        if (isNaN(roomsToClose)) {
            roomsToClose = parseInt(prompt("Okay c'mon. It has to be a number.", ""));
            if (isNaN(roomsToClose)) {
                alert("I'm done with you.");
                return;
            }
        }
        roomsToCloseInput.value = roomsToClose;
    }

    if (roomsToClose <= 0) {
        alert("Rooms to close should be more than 0.");
        return;
    }

    if (roomsToClose > gallery[0].length) {
        alert("Rooms to close should be less than the gallery length.");
        return;
    }

    clearSolutionGallery();
    clearSolutionText();

    showLoadingSpinner();

    const useDynamicProgramming = document.getElementById("dynamic").checked;
    const maximize = document.getElementById("maximize").checked;

    const solution = await startArtGallery(gallery, roomsToClose, useDynamicProgramming, maximize);

    hideLoadingSpinner();

    const solutionGalleryDivId = "solution-gallery";
    const solutionGalleryDiv = document.getElementById(solutionGalleryDivId);
    buildGalleryTable(
        gallery,
        solutionGalleryDiv,
        solutionGalleryDivId,
        solution.solution
    );
    buildGallerySolutionText(solution.cost, solution.duration, useDynamicProgramming);
}

/**
 * Displays the solution table for the narrow art gallery problem.
 *
 * Note that the div that the table is being appended to is cleared before the
 * table appended. So anything else in the div will be removed by this method.
 *
 * If the gallery solution is provided, rooms will be marked as closed and
 * opened. If the gallery solution is not provided, the table cells will be
 * inputs instead of just text.
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
    if (gallerySolution == null) {
        table.classList.add("input");
    }

    for (const i in [0, 1]) {
        const tr = table.insertRow();
        for (let j = 0; j < gallery[i].length; j++) {
            const td = tr.insertCell();
            if (gallerySolution == null) {
                const input = document.createElement("input");
                input.type = "number";
                input.value = gallery[i][j];
                td.appendChild(input);
            } else {
                td.appendChild(document.createTextNode(gallery[i][j]));
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
 * Builds the solution text. This displays the header and the cost and duration
 * of the solution.
 *
 * @param {Number} cost The cost of the solution.
 * @param {Number} duration The duration of the solution.
 * @param {Boolean} usedDynamicProgramming Set to true if dynamic programming is used, false otherwise.
 */
function buildGallerySolutionText(cost, duration, usedDynamicProgramming) {
    clearSolutionText();

    const solutionTextDiv = document.getElementById("solution-text");

    const h1 = document.createElement("h1");
    h1.innerText = "Solution";

    const explanationText = document.createElement("p");
    explanationText.innerHTML = `Completed with ${usedDynamicProgramming ? "dynamic programming" : "brute force (recursive backtracking)"} in <b>${duration} ms</b>`;

    const costText = document.createElement("p");
    costText.innerHTML = `Cost: <b>${cost}</b>`;

    solutionTextDiv.appendChild(h1);
    solutionTextDiv.appendChild(explanationText);
    solutionTextDiv.appendChild(costText);
}

/**
 * Clears the gallery in the solution section.
 */
function clearSolutionGallery() {
    const solutionGalleryDiv = document.getElementById("solution-gallery");
    solutionGalleryDiv.innerHTML = "";
}

/**
 * Clears the text in the solution section.
 */
function clearSolutionText() {
    const solutionTextDiv = document.getElementById("solution-text");
    solutionTextDiv.innerHTML = "";
}

/**
 * Displays the loading spinner to show that a solution is being computed.
 */
function showLoadingSpinner() {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "block";
}

/**
 * Hides the loading spinner to show that the solution computation has finished.
 */
function hideLoadingSpinner() {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "none";
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
function updateInputGallerySize() {
    const numberOfColumns = parseInt(document.getElementById("number-of-columns").value);

    if (isNaN(numberOfColumns) || numberOfColumns == 0) {
        return;
    }

    clearSolutionGallery();
    clearSolutionText();

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
    clearSolutionGallery();
    clearSolutionText();

    const gallery = getInputGallery();
    const newGallery = gallery.map(row => row.map(() => Math.floor(Math.random() * 10)));
    const inputGalleryDiv = document.getElementById("input");
    buildGalleryTable(newGallery, inputGalleryDiv, "input-gallery");
}

document.getElementById("start-button").addEventListener("click", startNarrowArtGallery);
document.getElementById("number-of-columns").addEventListener("input", updateInputGallerySize);
document.getElementById("randomize-button").addEventListener("click", randomizeGalleryRoomValues);

window.addEventListener("load", randomizeGalleryRoomValues);
