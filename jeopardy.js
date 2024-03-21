const gameCategories = 6;
const gameQuestions = 5;
const jeopardyBoard = $("#jeopardy");

let categories = [];

const categoryUrl = "http://cluebase.lukelav.in/categories";
const clueUrl = "http://cluebase.lukelav.in/clues";

async function setupGame() {
  const baseCategories = await axios.get(categoryUrl, {
    params: {
      limit: 100,
    },
  });
  //console.log(baseCategories);
  let clues = [];
  let categoryNames = getUsedCategories(baseCategories);
  const cluesList = await axios.get(clueUrl, {
    params: {
      limit: 1000,
    },
  });
  clues.push(cluesList.data.data);
  getUsableClues(categoryNames, clues);

  buildGameBoard();
}
// get ids from categories used in the game
function getUsedCategories(baseCats) {
  //con
  const allCategories = baseCats.data.data;
  // selects random categories from list provided
  let randomNames = [];
  for (let i = 0; i < gameCategories; i++) {
    const random = Math.floor(Math.random() * allCategories.length);
    randomNames.push(allCategories[random]);
  }
  let categoriesUsed = [];
  // push each id into an array
  for (ct of randomNames) {
    categoriesUsed.push(ct.category);
  }
  return categoriesUsed;
}

function getUsableClues(usedCats, clues) {
  let clueData = [];
  let cats = usedCats;
  const iterator = cats.values();
  for (const value of iterator) {
    for (let j = 0; j < gameQuestions; j++) {
      console.log(j);
      for (let i = 0; i < clues[0].length; i++) {
        if (value === clues[0][i].category) {
          clueData = {
            category: value,
            answer: clues[0][i].clue,
            question: clues[0][i].response,
            points: clues[0][i].value,
          };
        } else {
          //Due to clue unavailiblity with this AP
          clueData = {
            category: value,
            answer: "Unknown",
            question: "Unknown",
            points: "Unknown",
          };
          // pushes data into categories array
        }
      }
      categories.push(clueData);
    }
  }
}

// fills jeopardy table with data
function buildGameBoard() {
  // makes new array of each title
  let titles = categories.map((title) => {
    return title.category;
  });
  // loops through each title and makes table headers of each
  $("thead").add("tr");
  for (let x = 0; x < gameCategories; x++) {
    const catHeader = document.createElement("th");
    catHeader.innerText = titles[x * 5];
    $("thead").append(catHeader);
  }
  //makes the rest of the table and gives each an id of its location
  for (let y = 0; y < gameQuestions; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < gameCategories; x++) {
      const cell = document.createElement("td");
      cell.innerHTML = `<div id=${x}-${y}>?</div>`;
      row.append(cell);
    }
    jeopardyBoard.append(row);
  }
}

function handleClick(e) {
  // x and y are used to change the data displayed into the correct questions and answers
  let x = e.target.id[0];
  let y = e.target.id[2];
  // if answer is displayed, do nothing
  if (e.target.classList.contains("answer")) {
    return;
    // if question is displayed, display answer instead
  } else if (e.target.classList.contains("question")) {
    e.target.innerText = categories[x].answer;
    e.target.classList.remove("question");
    e.target.classList.add("answer");
    // if nothing is displayed yet, display question
  } else {
    e.target.innerText = categories[x].question;
    e.target.classList.add("question");
  }
}

// Reload Button
$("#restart").on("click", function () {
  location.reload();
});

$(document).ready(function () {
  setupGame();
  $("#jeopardy").on("click", "div", handleClick);
});
