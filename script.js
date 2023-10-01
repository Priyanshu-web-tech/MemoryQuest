const cardsContainer = document.querySelector(".cards");
const moveCounter = document.getElementById("move-counter");
const resetButton = document.getElementById("reset-button");
const scoreDisplay = document.getElementById("score");
const bestscoreDisplay = document.getElementById("best-score");
const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start-button");

let cardsArray = [];
let bestScore = localStorage.getItem("bestScore") || 0;
let score = 0;
let moves = 0;
let timer;

bestscoreDisplay.textContent = bestScore;

let isGameStarted = false;
let activeCard = null;
let awaitingFinish = false;
let pairedCards = [];

async function fetchCardData() {
  try {
    const response = await fetch("./assets/data.json");
    const data = await response.json();
    cardsArray = data;
    initializeGame();
  } catch (error) {
    console.error("Error fetching card data:", error);
  }
}

function initializeGame() {
  pairedCards = [...cardsArray, ...cardsArray];
  const cardcount = pairedCards.length;

  for (let i = 0; i < cardcount; i++) {
    const randomIndex = Math.floor(Math.random() * pairedCards.length);
    const card = buildCard(pairedCards[randomIndex]);
    pairedCards.splice(randomIndex, 1);
    cardsContainer.appendChild(card);
  }
}

function buildCard(card) {
  const element = document.createElement("div");
  element.classList.add("card");
  element.setAttribute("data-name", card.name);

  element.addEventListener("click", () => {
    if (
      !isGameStarted ||
      awaitingFinish ||
      element.classList.contains("matched")
    ) {
      return;
    }

    element.style.background = `url(${card.img})`;
    element.style.backgroundSize = "cover";

    if (!activeCard) {
      activeCard = element;
      return;
    }

    const nameToMatch = activeCard.getAttribute("data-name");
    moves++;
    moveCounter.textContent = moves;

    if (nameToMatch === card.name) {
      element.classList.add("matched");
      activeCard.classList.add("matched");
      activeCard = null;
      score++;
      scoreDisplay.textContent = score;

      if (score > bestScore) {
        bestScore = score;
        bestscoreDisplay.textContent = bestScore;
        localStorage.setItem("bestScore", bestScore);
      }
    } else {
      awaitingFinish = true;
      setTimeout(() => {
        element.style.background =
          'url("https://via.placeholder.com/150.png/000000/808080?text=")';
        activeCard.style.background =
          'url("https://via.placeholder.com/150.png/000000/808080?text=")';
        awaitingFinish = false;
        activeCard = null;
      }, 1000);
    }
  });

  return element;
}

resetButton.addEventListener("click", () => {
  location.reload();
});

startButton.addEventListener("click", startGame);

function startGame() {
  if (!isGameStarted) {
    cardsContainer.classList.remove("disabled");
    startButton.style.display = "none";

    let seconds = 60;

    timer = setInterval(function () {
      timerDisplay.textContent = seconds + " sec";
      seconds--;

      if (seconds < 0 || score == 8) {
        endGame();
      }
    }, 1000);

    isGameStarted = true;
  }
}

function showModal(message) {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");

  modalText.textContent = message;
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function endGame() {
  cardsContainer.classList.add("disabled");
  clearInterval(timer);
  const userStats = `Your Score: ${score}\nBest Score: ${bestScore}\nMoves: ${moves}`;
  if (score === 8) {
    showModal("Congratulations! You finished before the timer!\n" + userStats);
  } else {
    showModal("Time's up!\n" + userStats);
  }

  if (score > bestScore) {
    bestScore = score;
    bestscoreDisplay.textContent = bestScore;
    localStorage.setItem("bestScore", bestScore);
  }
}

fetchCardData();