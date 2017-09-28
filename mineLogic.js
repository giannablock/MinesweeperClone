/* -------------------------------------------------------------------------------
----------------------------------------------------------------------------------
PROPERTIES
----------------------------------------------------------------------------------
------------------------------------------------------------------------------- */
var board; // 2D array of char values
var boardSize; // int dimension of the board height/width. Ex: boardSize=8 is an 8x8
var numMines; // number of mines on the board
var gamePlay; // boolean that tells you if the player is allowed to move
var hiddenCells; // tells how many cells are unclicked. Helps determine a win.
var minesCountdown; // displays how many mines the player believes they have left.
										// begins countdown at numMines, updates with flag counts

/* -------------------------------------------------------------------------------
----------------------------------------------------------------------------------
DECLARE, INITIALIZE, AND DISPLAY BOARD
----------------------------------------------------------------------------------
------------------------------------------------------------------------------- */

document.getElementById("beginner").addEventListener("click", setBeginner);
document.getElementById("intermediate").addEventListener("click", setIntermediate);
document.getElementById("expert").addEventListener("click", setExpert);

function setBeginner() {
  boardSize = 8;
  numMines = 10;
  minesCountdown = 10;
  createBoard();
}

function setIntermediate() {
  boardSize = 16;
  numMines = 40;
  minesCountdown = 40;
  createBoard();
}

function setExpert() {
  boardSize = 24;
  numMines = 100;
  minesCountdown = 100;
  createBoard();
}

function createBoard() {
  try { //delete table if it exists. Didn't know how to check if it exists besides "try"-ing.
    var oldTable = document.getElementById('table');
    oldTable.parentNode.removeChild(oldTable);
  } catch (err) {} //table doesn't exist. No need to throw error.

  gamePlay = true;
  document.getElementById('message').innerHTML = "";
  hiddenCells = boardSize * boardSize;
  board = [];
  //create array of arrays
  for (var i = 0; i < boardSize; i++) {
    board.push([]);
  }
  //initialize the 2D array with space chars
  for (var i = 0; i < boardSize; i++) {
    for (var j = 0; j < boardSize; j++) {
      board[i][j] = ' ';
    }
  }
  // the following 3 tasks are broken into helper methods to make the code more readable
  fillBoardMines(0);
  fillBoardNumbers();
  displayBoard();
}

//randomly populate the correct number of mines on the board
function fillBoardMines(counter) {
  while (counter < numMines) {
    var a = Math.floor(Math.random() * boardSize);
    var b = Math.floor(Math.random() * boardSize);
    if (board[a][b] == ' ') {
      board[a][b] = '*';
      counter += 1;
    }
  }
}

//fill the numbers on the board to reflect amount of adjacent mines per cell
function fillBoardNumbers() {
  for (var i = 0; i < boardSize; i++) {
    for (var j = 0; j < boardSize; j++) {
      if (board[i][j] !== '*') {
        var count = 0 //counts the cell's surrounding mines
        // checks clockwise for mines around the board[i][j] starting from the left cell
        // "catch"-es for edges cases
        try {if (board[i - 1][j] == '*') count += 1;} catch (err) {}
        try {if (board[i - 1][j - 1] == '*') count += 1;} catch (err) {}
        try {if (board[i][j - 1] == '*') count += 1;} catch (err) {}
        try {if (board[i + 1][j - 1] == '*') count += 1;} catch (err) {}
        try {if (board[i + 1][j] == '*') count += 1;} catch (err) {}
        try {if (board[i + 1][j + 1] == '*') count += 1;} catch (err) {}
        try {if (board[i][j + 1] == '*') count += 1;} catch (err) {}
        try {if (board[i - 1][j + 1] == '*') count += 1;} catch (err) {}

        if (count > 0) {
          board[i][j] = count;
        }
      }
    }
  }
}
//creates the <table>. The <td> are declared and used as objects to hold cell properties
function displayBoard() {
  var table = document.createElement('table');
  table.setAttribute('id', 'table');
  for (var i = 0; i < boardSize; i++) {
    var tr = document.createElement('tr');
    for (var j = 0; j < boardSize; j++) {
      var td = document.createElement('td');
      /* -------------------------------------------------------------------------------
			----------------------------------------------------------------------------------
			<TD> CELL PROPERTIES
			----------------------------------------------------------------------------------
			------------------------------------------------------------------------------- */
      td.innerHTML = board[i][j]; //writes the char board value in the td cell
      td.longitude = i; // keeps track of the row
      td.latitude = j; // keeps track of the column
      td.className = "hidden"; //hides the cell value
      td.onclick = function() {
        cellClick(this);
      }
      td.oncontextmenu = function() { //right click creates or removes a flag
        toggleFlag(this);
        return false; //has to return false to overrride default right-click behavior
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.body.appendChild(table); //displays the created table on the page
}

/* printBoard() used for debugging purposes only */
function printBoard() {
  var returningString = "";
  for (var i = 0; i < boardSize; i++) {
    for (var j = 0; j < boardSize; j++) {
      var boardChar = '_';
      if (board[i][j] !== ' ') {
        boardChar = board[i][j]; //spaces ruin the print formatting, so they are converted to '_'
      }
      returningString += boardChar + ",";
    }
    returningString += "\n";
  }
  return returningString;
}

/* -------------------------------------------------------------------------------
----------------------------------------------------------------------------------
GAME LOGIC
----------------------------------------------------------------------------------
------------------------------------------------------------------------------- */
function cellClick(cell) {
  // if the cell clicked is an unhidden number with a corresponding amount of adjacent flags,
	// then clicking on the cell will uncover the other adjacent hidden cells that are not flagged.
  // It's a useful and desired shortcut used by expert players.
  if (gamePlay == true && cell.className == 'unhidden' && cell.innerHTML !== '*' && cell.innerHTML !== ' ') {
    var flaggedMinesCount = 0; //counts how many adjacent cells are flagged as mines
    var cellLong = cell.longitude;
    var cellLat = cell.latitude;
    //almost a direct copy and paste from checkSurrounding() because similar concept
    //counts the amount of adjacent flags
    for (var i = 0, row; row = table.rows[i]; i++) {
      for (var j = 0, cell1; cell1 = row.cells[j]; j++) {
        if (!(cell1.longitude == cellLong && cell1.latitude == cellLat) &&
          Math.abs(cell1.longitude - cellLong) <= 1 && Math.abs(cell1.latitude - cellLat) <= 1 && cell1.className == 'hidden flagged') {
          flaggedMinesCount += 1;
        }
      }
    }
    //if the counted flags are the same as the amount of mines, the rest of the adjacent hidden cells are clicked/displayed
    if (flaggedMinesCount == cell.innerHTML) {
      for (var i = 0, row; row = table.rows[i]; i++) {
        for (var j = 0, cell2; cell2 = row.cells[j]; j++) {
          if (!(cell2.longitude == cellLong && cell2.latitude == cellLat) &&
            Math.abs(cell2.longitude - cellLong) <= 1 && Math.abs(cell2.latitude - cellLat) <= 1 && cell2.className == 'hidden') {
            cell2.onclick();
          }
        }
      }
    }
  }
  //regular click for hidden cells
  if (gamePlay == true && cell.className == 'hidden') {
    cell.className = "unhidden";
    hiddenCells -= 1;
    if (cell.innerHTML == '*') {
      gamePlay = false;
      document.getElementById('message').innerHTML = "You lose!";
      hiddenCells += 1;
    }
    if (cell.innerHTML == ' ') {
      checkSurrounding(cell.longitude, cell.latitude);
    }
    checkWin();
  }
}

function toggleFlag(cell) {
  if (gamePlay == true) {
    if (cell.className == "hidden flagged") {
      cell.className = "hidden"; //remove flag if already there
      minesCountdown +=1; //when cell is unflagged, increment minesCountdown
      updateMinesCountdown(minesCountdown);
    } else if (cell.className == "hidden") {
      cell.className = "hidden flagged"; //add flag if not there
      minesCountdown -=1; //when cell is flagged, decrement minesCountdown
      updateMinesCountdown(minesCountdown);
    } else {} //do nothing
  }
}

function checkSurrounding(blankLong, blankLat) {
  var table = document.getElementById('table');
  for (var i = 0, row; row = table.rows[i]; i++) {
    for (var j = 0, cell; cell = row.cells[j]; j++) {
      //iterate through cells in each row
      //cells accessed using the "cell" variable assigned in the for loop
      if (!(cell.longitude == blankLong && cell.latitude == blankLat) &&
        Math.abs(cell.longitude - blankLong) <= 1 && Math.abs(cell.latitude - blankLat) <= 1) {
        cell.onclick();
      }
    }
  }
}

function checkWin() {
  if (gamePlay == true && hiddenCells == numMines) {
    gamePlay = false;
    document.getElementById('message').innerHTML = "You win!";
  }
}

function updateMinesCountdown(newCount){
	var countdown = document.getElementById('message');
  countdown.innerHTML = "You have <b>" + newCount + "</b> mines left.";
}
