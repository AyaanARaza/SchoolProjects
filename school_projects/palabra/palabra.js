let wordList = [];
let maxWordLength = 0;
let currentRow = 0;
let currentCol = 0;
let gameOver = false;

function createBoard(rows = 7, cols = maxWordLength) {
    const board = document.getElementById("board");
    board.innerHTML = "";
    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    board.style.gap = "5px";
    board.style.justifyContent = "center";

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.dataset.row = r;
            tile.dataset.col = c;
            board.appendChild(tile);
        }
    }
}

function insertChar(char) {
    if (currentCol < maxWordLength) {
        const tile = document.querySelector(
            `.tile[data-row="${currentRow}"][data-col="${currentCol}"]`
        );
        if (tile) {
            tile.textContent = char === "•" ? "•" : char.toUpperCase(); 
            tile.dataset.letter = char; 
            currentCol++;
            return true;
        }
    }
    return false;
}



window.onload = () => {
    fetch('words.txt')
        .then(response => response.text())
        .then(data => {
            wordList = data
                .split('\n')
                .map(w => w.trim())
                .filter(w => w !== "");

            maxWordLength = wordList.reduce((max, word) => Math.max(max, word.length), 0);
            const marquee = document.getElementById("wordsMarquee");
            marquee.innerHTML = "<strong>Possible Words:</strong> " + wordList.join(" • ");
            let originalSecret = wordList[Math.floor(Math.random() * wordList.length)];
            let secret = originalSecret + " ".repeat(maxWordLength - originalSecret.length);
            createBoard();

            document.addEventListener("keydown", (e) => {
                if (gameOver || currentRow >= 7) return;
              
                const key = e.key;
              
                if (/^[a-zA-Z]$/.test(key)) {
                    insertChar(key.toLowerCase());
                }
                 else if (key === "Backspace" && currentCol > 0) {
                  currentCol--;
                  const tile = document.querySelector(
                    `.tile[data-row="${currentRow}"][data-col="${currentCol}"]`
                  );
                  if (tile) {
                    tile.textContent = "";
                  }
                }
              });
              
            document.getElementById("enye").addEventListener("click", () => {
                if (currentRow >= 7 || currentCol >= maxWordLength) return;
                insertChar("ñ");
            });

            document.getElementById("blank").addEventListener("click", () => {
                if (currentRow >= 7 || currentCol >= maxWordLength) return;
                insertChar("•");
            });

            document.getElementById("refresh").addEventListener("click", () => {
                location.reload();
              });
              

            document.getElementById("submit").addEventListener("click", () => {
                if (gameOver) return;
                if (currentCol < maxWordLength) {
                    alert("Please fill out the entire row before submitting.");
                    return;
                }

                let guess = "";
                for (let c = 0; c < maxWordLength; c++) {
                    const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${c}"]`);
                    const letter = tile.dataset.letter || "•";
                    guess += letter;
                }

                if (guess.length < maxWordLength || [...guess].some(ch => ch === "")) {
                    return;
                }

                const secretArray = secret.split("");
                const guessArray = guess.split("");
                const status = Array(maxWordLength).fill("absent");
                const letterCount = {};

                for (let i = 0; i < maxWordLength; i++) {
                    const g = guessArray[i] === "•" ? " " : guessArray[i];
                    const s = secretArray[i];
                    if (g === s) {
                        status[i] = "correct";
                        letterCount[g] = (letterCount[g] || 0) + 1;
                    }
                }

                for (let i = 0; i < maxWordLength; i++) {
                    if (status[i] === "correct") continue;

                    const g = guessArray[i] === "•" ? " " : guessArray[i];
                    const countInSecret = secretArray.filter(c => c === g).length;
                    const used = letterCount[g] || 0;

                    if (secretArray.includes(g) && used < countInSecret) {
                        status[i] = "present";
                        letterCount[g] = used + 1;
                    }
                }

                for (let i = 0; i < maxWordLength; i++) {
                    const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${i}"]`);
                    tile.classList.add(status[i]);
                }

                const normalizedGuess = guess.replace(/•/g, " ");
                if (normalizedGuess === secret) {
                    gameOver = true;
                    alert("🎉 You guessed the word!");
                    return;
                }

                currentRow++;
                currentCol = 0;

                if (currentRow >= 7) {
                    gameOver = true;
                    alert("Out of guesses! The word was: "+ secret);
                }
            });




        })
        .catch(error => {
            console.error("Failed to load words.txt:", error);
        });

};
