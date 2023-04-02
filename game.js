const canvas = document.querySelector ('#game');
const game = canvas.getContext ('2d');
const btnUp = document.querySelector ('#up');
const btnDown = document.querySelector ('#down');
const btnRight = document.querySelector ('#right');
const btnLeft = document.querySelector ('#left');
const spanLives = document.querySelector ('#lives');
const spanTime = document.querySelector ('#time');
const spanRecord = document.querySelector ('#record');
const pResult = document.querySelector ('#result');
const btnReboot = document.querySelector ('#reboot');


let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;
let timeStart;
let timePlayer;
let timeInterval;
let collisionInterval;

const playerPosition = {
    x: undefined,
    y: undefined,
};

const giftPosition = {
    x: undefined,
    y: undefined,
};

let enemyPositions = [];

//cuando cargue totalmente el codigo html, ahi recien funcionará la funcion setCanvasSize//
window.addEventListener('load', setCanvasSize);
//cuando cambie el tamaño de la ventana funcionará la funcion setCanvasSize//
window.addEventListener('resize', setCanvasSize);
//esta funcion hace que el valor no tenga decimales//
function fixNumber(n){return Number(n.toFixed(0));}
    function setCanvasSize () {
             //si el alto es las grande que el ancho, hara un cuadrado con las medidas del ancho, sino al reves//
        //innerWidth indica el ancho e innerHeight el ancho//
        if (window.innerHeight > window.innerWidth){
            canvasSize = window.innerWidth * 0.7;
        } else {
            canvasSize = window.innerHeight * 0.7;
        }
        //evita que haya problemas de posicionamiento de objetos si el canvasSize tiene muchos numeros detras de la coma//
        canvasSize = Number(canvasSize.toFixed(0));
        //cambia el alto y el ancho del canvas//
        canvas.setAttribute ('width', canvasSize);
        canvas.setAttribute ('height', canvasSize);
        //cambia el alto y ancho de los elementos dependiendo el tamaño del canvas//
        elementsSize = fixNumber (canvasSize / 10);
        //cuando se cambia el tamaño del mapa, cambia la posicion del player para que se adapte a las nuevas medidas//
        playerPosition.x = undefined;
        playerPosition.y= undefined;

        startGame();
    }

    function startGame (){
        
        game.font = elementsSize + 'px Verdana';
        game.textAlign = 'end';

        //trae del js maps el mapa que se encuentre en la posicion correspondiente del array//
        const map = maps[level];
        //si no hay más mapas que cargar manda un mensaje//
        if (!map){
            winGame();
            return;
        }
        //Si timeStart no tiene ningun valor, le pone de valor el horario en que empieza el juego//
        if (!timeStart) {
            //Date.now muestra la hora actual//
            timeStart= Date.now();
            //ejecuta la funcion showTime cada 100 milisegundo y lo pone en la constante timeInterval//
            timeInterval = setInterval(showTime,100);
        }

        //.trim elimina los espacios al principio y al final de un string//
        //.split crea un array en base a un string diviendolo dependiendo el valor que pongamosen split//
        const mapRows = map.trim().split('\n');
        //.map genera arreglos a partir de otros arreglos y devolvera las filas de mapsRows y el resultado de cada fila sera row//
        //row si es un string y a el si le puede aplicar trim y split//
        const mapRowsCols = mapRows.map (row => row.trim().split(''));
        //muestra las vidas del usuario//
        showLives();
        //limpia el cambas para que el array no se llene de elementos cada vez que nos movemos//
        enemyPositions = [];
        //Borra todo el cambias para generar uno nuevo con el usuario en su nueva posición//
        game.clearRect(0,0,canvasSize,canvasSize);
        //hace un array bidimensional con forEach y trae los elementos del mapa//
        mapRowsCols.forEach((row, rowI) => {
            row.forEach((col, colI) => {
                const emoji =emojis [col];
                const posX = elementsSize * (colI + 1);
                const posY = elementsSize * (rowI + 1);

                //revisa si en la columna hay un 0 y le da esos valores a la posicion del usuario//
                if (col == 'O') {
                    //si el usuario ya tiene una posición nueva aparece en esa posición y no en la inicial al hacer clearRect//
                    if (!playerPosition.x && !playerPosition.y) {
                        playerPosition.x = fixNumber (posX);
                        playerPosition.y = fixNumber (posY);
                        console.log({playerPosition});
                    }
                }    
                    else if (col =='I') {
                        giftPosition.x = Number(posX.toFixed(0));
                        giftPosition.y = Number (posY.toFixed(0));
                    }
                    else if (col == 'X') {
                        enemyPositions.push (
                            {
                             x : posX,
                             y : posY,   
                            }
                        )
                    }
                game.fillText (emoji, posX, posY);
            });
        });
        movePlayer();
        showRecord();
        //hace un array bidimensional y trae los elementos del mapa//
       // for(let row=1; row<=10; row++) {
       //     for (let col=1; col<=10; col++) {
       //         game.fillText (emojis [mapRowsCols[row-1][col-1]],elementsSize * col,elementsSize * row);
       //     }
       // }

        //fillRect delimita una zona//
        //en canvas el eje X es de izquierda a derecha y el Y es de arriba a abajo//
        //game.fillRect (0,0,100,100);//
        //game.clearRect (0,0,0,0) borra una zona//

        //fillText nos permite usar texto dentro del canvas e indicarle a donde aparecerá//
        //game.fillText ('TEXTO',0,0);

        //font sirve para cambiar el tamaño y fuente del texto//
        //game.font = '25px, Verdana';

        //fillStyle sirve para cambiar de color tanto el texto como el canvas//
        //game.fillStyle = 'purple'; 

        //Alinea el texto, puede ser right, left, end, start, center//
        //game.textAlight ='center';
    }
      //renderiza al jugador//
      function movePlayer () {
      
      //verifica si el paquete esta en la misma posición que el usuario//
      const giftCollisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed (3);
      const giftCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed (3); 
      const giftCollision = giftCollisionX && giftCollisionY; 
      if (giftCollision) {
        console.log ('Subiste de nivel');
        levelWin();
      }
      //
      const enemyCollision = enemyPositions.find(enemy => 
        { enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
          enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
          return enemyCollisionX && enemyCollisionY  });
          
      if (enemyCollision) {
        showColision();
        //espera 1 segundo para empezar la funciona level fail//
        setTimeout (levelFail,200);
    }
        
        game.fillText (emojis['PLAYER'], playerPosition.x, playerPosition.y);

    }
      //manda a cargar un nuevo mapa//  
      function levelWin () {
        console.log ('subiste de nivel');
        level ++;
        startGame();
    }
      function winGame (){
        console.log('terminaste el juego');
        //detiene la funcion timeInterval para que el contador se detenga cuando se termina el juego//
        clearInterval(timeInterval);
        //verifica si se supero el record y guarda el record en el localStorage para que no se pierda//
        const playerTime =  Date.now () - timeStart;
        const recordTime= localStorage.getItem('record_time');
        msjHappy('GANASTE');
        if (recordTime) {
            if (recordTime >= playerTime ) {
                localStorage.setItem ('record_time', playerTime);
                pResult.innerHTML ='superaste el record';
                msjRecord('superaste el record');
            }else {
                pResult.innerHTML ='no superaste el record';
                msjRecord('no superaste el record');
            }
        }else {
            localStorage.setItem ('record_time', playerTime);
            pResult.innerHTML ='muy bien para ser la primera vez';
            msjRecord ('muy bien para ser la primera vez');
        }
        console.log(recordTime,playerTime);
      }
      //genera un mensaje en canvas//
      function msjHappy (msj) {
        game.fillStyle = 'green';
        game.fillRect(0, (canvasSize/2.5), canvasSize, (canvasSize/10));
        game.fillStyle = 'yellow';
        game.textAlign = 'center';
        game.fillText(msj,(canvasSize/2),(canvasSize/2));
      }
      function msjSad (msj) {
        game.fillStyle = 'red';
        game.fillRect(0, (canvasSize/2.5), canvasSize, (canvasSize/10));
        game.fillStyle = 'black';
        game.textAlign = 'center';
        game.fillText(msj,(canvasSize/2),(canvasSize/2));
      }
      function msjRecord (msj) {
        game.fillStyle = 'yellow';
        game.fillRect(0, (canvasSize/2), canvasSize, (canvasSize/9));
        game.fillStyle = 'green';
        game.textAlign = 'center';
        game.fillText(msj,(canvasSize/2),(canvasSize/1.7), (canvasSize));
      }
      //Resta vidas si colisionas y si lo haces mas de tres veces el persona empieza en el nivel 0//
      function levelFail() {
        lives --;
        if (lives === 0) {
            console.log('moriste')
            msjSad ('PERDISTE');
            level =0;
            lives = 3;
            timeStart = undefined;
        }
        playerPosition.x = undefined;
        playerPosition.y = undefined;
        setTimeout (startGame,1000)
      }
      //muestra el emoji fuego cuando hay un colision y borra al personaje//
      function showColision() {
        game.fillText (emojis['BOMB_COLLISION'], playerPosition.x, playerPosition.y);
        playerPosition.x = undefined;
        playerPosition.y = undefined;
        console.log ('choque');
      }
      //muestra las vidas//
      function showLives () {
        //Array indica que se va a crear un array con la misma cantidad de elementos que tiene lives y .fill inserta en cada lugar del array un corazon//
        const heartsArray = Array(lives).fill(emojis['HEART']);
       //reinicia las vidas para que no se solapen cuando el persona se mueva//
       spanLives.innerHTML ="";
       //forEach recorre el array y .append agrega los corazones sin solaparlos// 
       heartsArray.forEach(heart => spanLives.append(heart)); 
      }
      //muestra el tiempo//
      function showTime () {
        spanTime.innerHTML = Date.now () - timeStart;
      }
      //muestra el record siempre que muestra el tiempo
      function showRecord () {
        spanRecord.innerHTML = localStorage.getItem('record_time');

    }
    
    
    //le da uso a los botones//
    window.addEventListener ('keydown', moveByKeys);
    btnUp.addEventListener ('click', moveUp );
    btnDown.addEventListener ('click', moveDown);
    btnRight.addEventListener ('click', moveRight);
    btnLeft.addEventListener ('click', moveLeft);
    // reinicia el juego//
    btnReboot.addEventListener ('click', gameReboot );
    function gameReboot() {
       location.reload();
    }
    //verifica que tecla del teclado se toca y hace una acción//
    function moveByKeys (event){
        if (event.key == 'ArrowUp') {
            moveUp();
        }else if (event.key == 'ArrowDown') {
            moveDown ();
        }else if (event.key == 'ArrowLeft') {
            moveLeft();
        }else (event.key == 'ArrowRight') 
            moveRight();
        
    }

    function moveUp () {
        console.log (playerPosition.y);
        if ((playerPosition.y - elementsSize) < elementsSize) {
            console.log('nos caimos');
        }else {
            playerPosition.y -= elementsSize;
            startGame();
        }
    }
    function moveDown () {
        console.log (playerPosition.y);
        if ((playerPosition.y + elementsSize) > canvasSize) {
            console.log('nos caimos');
        }else {
        playerPosition.y += elementsSize;
        startGame(); }
    }
    function moveLeft () {
        console.log (playerPosition.x);
        if ((playerPosition.x - elementsSize) < elementsSize) {
            console.log('nos caimos');
        }else {
        playerPosition.x -= elementsSize;
        startGame();
        }
    }
    function moveRight () {
        console.log (playerPosition.x);
        if ((playerPosition.x + elementsSize) > canvasSize ) {
            console.log('nos caimos');
        }else {
        playerPosition.x += elementsSize;
        startGame();}
    }