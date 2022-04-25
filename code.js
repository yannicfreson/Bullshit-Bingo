let cards = document.getElementsByClassName("bingoCard");
let cardParents = document.getElementsByClassName("cardBG");
let shuffledWords = [];
let wordsSet = false;
var database = firebase.database();
let boardState = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

firebase
  .database()
  .ref("w")
  .on("value", (snapshot) => {
    if (snapshot.val() !== "no") {
      alert(capitalizeFirstLetter(snapshot.val()) + " has won!");
    }
  });

window.onload = function () {
  if (window.localStorage.getItem("playerName") === null) {
    document.getElementById("nameDiv").style.display = "block";
  } else {
    playerName = window.localStorage.getItem("playerName");
    shuffledWords = shuffle(
      words,
      `${new Date().getDay()}${stringToInt(playerName)}`
    );

    for (let i = 0; i < cards.length; i++) {
      cards[i].innerText = shuffledWords[i];
    }

    wordsSet = true;

    firebase
      .database()
      .ref("cd")
      .once("value", (snapshot) => {
        if (snapshot.val() !== new Date().getDate()) {
          firebase.database().ref("cd").set(new Date().getDate());
          firebase.database().ref("w").set("no");
          firebase.database().ref("p").set({});
        }
      });

    firebase
      .database()
      .ref(`p/${playerName}`)
      .once("value", (snapshot) => {
        if (snapshot.val() === null) {
          firebase.database().ref(`p/${playerName}`).set({
            bs: boardState,
            hb: false,
          });
        } else {
          boardState = snapshot.val().bs;
          updateCards();
        }
      });

    document.getElementById("nameDiv").style.display = "none";
    document.getElementById("boardDiv").style.display = "block";
  }
};

document
  .getElementById("playerName")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !wordsSet) {
      playerName = document.getElementById("playerName").value.toLowerCase();
      window.localStorage.setItem("playerName", playerName);
      shuffledWords = shuffle(
        words,
        `${new Date().getDay()}${stringToInt(playerName)}`
      );

      for (let i = 0; i < cards.length; i++) {
        cards[i].innerText = shuffledWords[i];
      }

      wordsSet = true;

      firebase
        .database()
        .ref(`p/${playerName}`)
        .once("value", (snapshot) => {
          if (snapshot.val() === null) {
            firebase.database().ref(`p/${playerName}`).set({
              bs: boardState,
              hb: false,
            });
          } else {
            boardState = snapshot.val().bs;
            updateCards();
          }
        });

      window.localStorage.setItem("playerName", playerName);
      document.getElementById("nameDiv").style.display = "none";
      document.getElementById("boardDiv").style.display = "block";
    }
  });

function updateCards() {
  for (let i = 0; i < cards.length; i++) {
    let cardRow = Math.floor(i / 5);
    let cardColumn = i % 5;
    if (boardState[cardRow][cardColumn] === 1) {
      cards[i].parentElement.style.backgroundColor = "#38bdf8";
    } else {
      cards[i].parentElement.style.backgroundColor = "#0c4a6e";
    }
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("bingoCard")) {
    let card = event.target;
    let cardIndex = Array.prototype.indexOf.call(cards, card);
    console.log(cardIndex);
    let cardRow = Math.floor(cardIndex / 5);
    let cardColumn = cardIndex % 5;
    if (boardState[cardRow][cardColumn] === 0) {
      boardState[cardRow][cardColumn] = 1;
      firebase.database().ref(`p/${playerName}`).update({
        bs: boardState,
      });
    } else {
      boardState[cardRow][cardColumn] = 0;
      firebase.database().ref(`p/${playerName}`).update({
        bs: boardState,
      });
    }
    updateCards();
    checkBingo(boardState);
  }
});

function stringToInt(string) {
  let result = 0;
  for (let i = 0; i < string.length; i++) {
    result += string.charCodeAt(i);
  }
  return result;
}

function shuffle(array, seed) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  seed = seed || 1;
  var random = function () {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  while (0 !== currentIndex) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function checkBingo(twoDimensionalArray) {
  let bingo = false;
  let bingoRow = [];
  let bingoColumn = [];
  let bingoDiagonal = [];
  let bingoDiagonal2 = [];

  for (let i = 0; i < twoDimensionalArray.length; i++) {
    for (let j = 0; j < twoDimensionalArray[i].length; j++) {
      if (twoDimensionalArray[i][j] === 1) {
        bingoRow.push(i);
        bingoColumn.push(j);
        if (i === j) {
          bingoDiagonal.push(i);
        }
        if (i + j === twoDimensionalArray.length - 1) {
          bingoDiagonal2.push(i);
        }
      }
    }
  }

  if (bingoRow.length === 5) {
    bingo = true;
  } else if (bingoColumn.length === 5) {
    bingo = true;
  } else if (bingoDiagonal.length === 5) {
    bingo = true;
  } else if (bingoDiagonal2.length === 5) {
    bingo = true;
  }

  if (bingo) {
    firebase.database().ref(`p/${playerName}`).update({
      hb: true,
    });
    firebase.database().ref().update({
      w: playerName,
    });
  }
}
