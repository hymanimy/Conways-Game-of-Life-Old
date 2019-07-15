var canvas = document.getElementById("mycanvas");
var ctx = canvas.getContext("2d");
var canvasHeight = 700; 
var canvasWidth = 1500;

var matrixColumnCount = 50; // this is how many squares there are per column
var matrixRowCount = 50; // this is how many squares there are per row
var gridsize = matrixColumnCount*matrixRowCount;
var squareWidth = 15;
var squarePadding = 0; 
var squareOffsetLeft = 10; 
var squareOffsetTop = 10;

var delay = 500; //1000ms delay per tick
var ticks = 0;

function populateMatrix(){
	var matrix = [];
	for(var c = 0; c < matrixColumnCount; c++){
		matrix[c] = []; //this creates matrixColumnCount rows
		for(var r = 0; r < matrixRowCount; r++){
			var squareX = r*(squareWidth+squarePadding) + squareOffsetLeft;
			var squareY = c*(squareWidth+squarePadding) + squareOffsetTop;
			matrix[c][r] = {x:squareX, y:squareY, alive:false};
		}
	}
	return matrix
}

function randomiseMatrix(){
    for(var c = 0; c<matrixColumnCount; c++){
        for(var r = 0; r<matrixRowCount; r++){
            if(Math.round(Math.random()*5) == 1){
                matrix[c][r].alive = true;
            }
            else{
                matrix[c][r].alive = false;
            }
        }
    }
    drawSquares();
    return matrix
}

function drawSquares(){
	for(var c = 0; c<matrixColumnCount; c++){
		for(var r = 0; r<matrixRowCount; r++){
			ctx.beginPath();
			ctx.rect(matrix[c][r].x, matrix[c][r].y, squareWidth, squareWidth)
			if(matrix[c][r].alive){
				ctx.fillStyle = "#000000";
			}
			else{
				ctx.fillStyle = "#ffffff";
			}
            ctx.fill();
            ctx.strokeStyle = "#DCDCDC";
            ctx.strokeRect(matrix[c][r].x, matrix[c][r].y, squareWidth, squareWidth)
            ctx.closePath();
		}
	}
}

function updateSquares(){
	/* Any live cell with fewer than two live neighbours dies, as if by underpopulation.
	Any live cell with two or three live neighbours lives on to the next generation.
	Any live cell with more than three live neighbours dies, as if by overpopulation.
	Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.*/
    var newMatrix =[]; //we must create a copy of the original as we update all blocks at once, not one at a time
    for(var i = 0; i < matrixColumnCount; i++){
        newMatrix[i] = [];
        for(var j = 0; j < matrixRowCount; j++){
            newMatrix[i][j] = {x:matrix[i][j].x, y: matrix[i][j].y, alive:matrix[i][j].alive}
        }
    }

    for(var c = 0; c<matrixColumnCount; c++){
		for(var r = 0; r<matrixRowCount; r++){
            var cell = matrix[c][r];
            var newCell = newMatrix[c][r];
			var livingNeighbourCount = 0; // we shall count how many living neighbours there are
			for(var i = c-1; i <c+2; i++){
				for(var j = r-1; j<r+2;j++){
					if(!(i==c && j ==r)){ //dont include itself as a neighbour
						if(getCell(i,j,matrix).alive){//now if on edge, the opposite side also includes neighbours
							livingNeighbourCount++;
						}
					}
				}
			}
			if(livingNeighbourCount < 2 && cell.alive){
				newCell.alive = false; //underpopulation rule
			}
			else if(livingNeighbourCount > 3 && cell.alive){
				newCell.alive = false; //overpopulation rule
			}
			else if(livingNeighbourCount == 3 && cell.alive == false){
				newCell.alive = true; //reproduction rule 
			}
		}
    }
    matrixCopy(matrix, newMatrix); //this replaces the current matrix with the new updated one hopefully
}

function matrixCopy(to,from){
    for(var i = 0; i<matrixColumnCount; i++){
        for(var j = 0; j<matrixRowCount; j++){
            to[i][j].alive = from[i][j].alive;
        }
    }
}

function getCell(x,y,matrix){ //this treats the 2d array as a torus, opposite sides are connected, edge cases now also have 8 neighbours
    return matrix[(x % matrixColumnCount + matrixColumnCount)%matrixColumnCount][(y % matrixRowCount + matrixRowCount)%matrixRowCount];
}

function drawStats(){
    ctx.font = "20px Arial";
    ctx.fillStyle = "#0095DD";
    var aliveCellCount = 0; 
    for(var c = 0; c < matrixColumnCount; c++){
        for(var r = 0; r < matrixRowCount; r++){
            if(matrix[c][r].alive){
                aliveCellCount++;
            }
        }
    }
    ctx.fillText("Ticks: " + ticks + " ~ Alive Cells: " + aliveCellCount + " ~ Delay: " + delay+"ms", 1100,100  )
}

document.addEventListener("mousedown", clickCells); //this checks for a mouseclick and then activates printMousePos

function printMousePos(event) {
    var X = (Math.floor((event.clientX - squareOffsetLeft)/squareWidth));
    var Y = (Math.floor((event.clientY - squareOffsetTop - 50)/squareWidth)); //minus 1 since arrays count from 0 not 1 
    if(X >= 0 && X < matrixColumnCount && Y >= 0 && Y < matrixRowCount){
        document.getElementById("mouse").innerHTML = "x: " + X + " ~ y: " + Y + " clientX: " + event.clientX + "clientY: " + event.clientY;
    }
    else{
        document.getElementById("mouse").innerHTML = " clientX: " + event.clientX + "clientY: " + event.clientY;
    }
}
  
function clickCells(event){//now this allows mouse scroll
    //needed to ensure there was no margin or padding between canvas and body of html in css otherwise that would change mouse coords
    var j = (Math.floor((event.clientX+document.body.scrollLeft+document.documentElement.scrollLeft- squareOffsetLeft)/squareWidth)); //j controls how far along in the nested array you are, therefore it requires the mouse X coordinate
    var i = (Math.floor((event.clientY+document.body.scrollTop+document.documentElement.scrollTop - squareOffsetTop)/squareWidth)); //minus 1 since arrays count from 0 not 1 
    if(i >= 0 && i < matrixColumnCount && j >= 0 && j < matrixRowCount){
        matrix[i][j].alive = !matrix[i][j].alive; //this inverts the current living state of the cell
    }
    drawSquares(); //draw the new update
}



function start(){
    intervalId = setInterval(draw, delay);
}

function stop(){
    clearInterval(intervalId);
}

function clearGrid(){
    //can't name it clear() since that is already a function whoops
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    for(var c = 0; c<matrixColumnCount; c++){
        for(var r = 0; r<matrixRowCount; r++){
            matrix[c][r].alive = false;
        }
    }
    drawSquares();
    stop();
}

function createGlider(i = Math.round(matrixColumnCount/2),j = Math.round(matrixRowCount/2)){
    var cellCoords = [[i,j],[i+1,j+1],[i+1,j+2],[i+2,j],[i+2,j+1]]; //these are the coordinates to create a glider
    for(var c = 0; c<cellCoords.length; c++){
        matrix[cellCoords[c][0]][cellCoords[c][1]].alive = true;
    }
    drawSquares();
    return matrix
}

function createPentadecathalon(i = Math.round(matrixColumnCount/2),j = Math.round(matrixRowCount/2)){
    var cellCoords = [[i,j],[i,j+1],[i,j+2],[i+1,j+1],[i+2,j+1],[i+3,j],[i+3,j+1],[i+3,j+2],[i+5,j],[i+5,j+1],[i+5,j+2],[i+6,j],[i+6,j+1],[i+6,j+2],[i+8,j],[i+8,j+1],[i+8,j+2],[i+9,j+1],[i+10,j+1],[i+11,j],[i+11,j+1],[i+11,j+2]];
    for(var c = 0; c<cellCoords.length; c++){
        matrix[cellCoords[c][0]][cellCoords[c][1]].alive = true;
    }
    drawSquares();
    return matrix
}

function draw(){
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
	drawSquares();
    updateSquares();
    drawStats();
    ticks++;
}


function droplist() {
    //when the drop down button is clicked, all of the elements in mydropdown show
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) { //if we didnt click on the dropdown menu of button
      var dropdowns = document.getElementsByClassName("dropdown-content"); //create an array of all the drop down buttons
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show'); //hide the elements
        }
      }
    }
}

matrix = populateMatrix();
matrix = randomiseMatrix();
drawStats();
drawSquares();