document.addEventListener('DOMContentLoaded', () => {
    // selection du DOM
    const grid = document.querySelector('.grid');
    const resultatDisplay = document.querySelector('#resultat');
    const menuScreen = document.getElementById('menu');
    const gameScreen = document.getElementById('game');
    const levelTitle = document.getElementById('level-title');

    const btn8 = document.getElementById('btn-8');
    const btn10 = document.getElementById('btn-10');
    const btn16 = document.getElementById('btn-16');
    const restartBtn = document.getElementById('restart-btn');
    const menuBtn = document.getElementById('menu-btn');
    
    // Sélection du bouton de mode
    const modeBtn = document.getElementById('mode-btn');

    // variables globales
    let width = 10;
    let bombAmount = 15;
    let squares = [];
    let isGameOver = false;
    let squaresRevealed = 0;
    let isFirstClick = true; 
    
    // Variable pour savoir si on est en mode Drapeau (true) ou Creuser (false)
    let isFlagging = false; 

    // gestion menu
    btn8.addEventListener('click', () => { launchGame(8, 10, "Niveau Facile"); });
    btn10.addEventListener('click', () => { launchGame(10, 15, "Niveau Moyen"); });
    btn16.addEventListener('click', () => { launchGame(16, 40, "Niveau Difficile"); });

    function launchGame(w, b, title) {
        width = w;
        bombAmount = b;
        menuScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        levelTitle.innerText = title;
        
        grid.style.width = `${width * 40}px`;
        grid.style.height = `${width * 40}px`;
        
        initBoard(); 
    }

    menuBtn.addEventListener('click', () => {
        gameScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
        grid.innerHTML = '';
    });

    restartBtn.addEventListener('click', () => { initBoard(); });

    //Gestion bouton Mode
    modeBtn.addEventListener('click', () => {
        // On inverse la valeur (Vrai devient Faux, Faux devient Vrai)
        isFlagging = !isFlagging;
        
        // On met à jour le texte du bouton pour le joueur
        if (isFlagging) {
            modeBtn.innerHTML = "🚩 Mode Drapeau";
            modeBtn.style.backgroundColor = "#e74c3c"; // Rouge pour indiquer danger/drapeau
        } else {
            modeBtn.innerHTML = "⛏️ Mode Creuser";
            modeBtn.style.backgroundColor = "#f39c12"; // Orange retour normal
        }
    });

    // init plateau
    function initBoard() {
        grid.innerHTML = '';
        squares = [];
        isGameOver = false;
        isFirstClick = true; 
        squaresRevealed = 0;
        
        // On remet le mode par défaut en "Creuser"
        isFlagging = false;
        modeBtn.innerHTML = "⛏️ Mode Creuser";
        modeBtn.style.backgroundColor = "#f39c12";

        resultatDisplay.innerHTML = '';
        resultatDisplay.classList.remove('win');

        // Création des cases
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            square.classList.add('valid');
            square.classList.add('case');
            grid.appendChild(square);
            squares.push(square);

            square.addEventListener('click', function(e) {
                click(square);
            });
        }
    }

    // placement des bombes apres le premier clique
    function addBombsAfterFirstClick(startIndex) {
        const prohibitedIndices = [parseInt(startIndex)];
        const startX = parseInt(startIndex) % width;
        const startY = Math.floor(parseInt(startIndex) / width);

        for (let x = startX - 1; x <= startX + 1; x++) {
            for (let y = startY - 1; y <= startY + 1; y++) {
                if (x >= 0 && x < width && y >= 0 && y < width) {
                    const neighborIndex = y * width + x;
                    if (!prohibitedIndices.includes(neighborIndex)) {
                        prohibitedIndices.push(neighborIndex);
                    }
                }
            }
        }

        let validIndices = [];
        for (let i = 0; i < width * width; i++) {
            if (!prohibitedIndices.includes(i)) {
                validIndices.push(i);
            }
        }

        validIndices.sort(() => 0.5 - Math.random());

        for (let i = 0; i < bombAmount; i++) {
            let indexToBomb = validIndices[i];
            squares[indexToBomb].classList.remove('valid');
            squares[indexToBomb].classList.add('bomb');
        }

        calculateNumbers();
    }

    // calculs des bombes voisines
    function calculateNumbers() {
        for (let i = 0; i < squares.length; i++) {
            let total = 0;
            const x = i % width;
            const y = Math.floor(i / width);

            if (squares[i].classList.contains('valid')) {
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        let nx = x + dx;
                        let ny = y + dy;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
                            let neighborIndex = ny * width + nx;
                            if (squares[neighborIndex].classList.contains('bomb')) {
                                total++;
                            }
                        }
                    }
                }
                squares[i].setAttribute('data', total);
            }
        }
    }

    // fonction de clic 
    function click(square) {
        let currentId = square.id;

        if (isGameOver) return;
        
        // Si la case est déjà révélée on ne fait rien
        if (square.classList.contains('checked')) return;

        // gestion mode drapeau
        if (isFlagging) {
            addFlag(square); // on appelle la fonction qui gère le drapeau
            return; 
        }

        // si la case a un drapeau, on interdit de creuser
        if (square.classList.contains('flag')) {
            return;
        }

        // si c'est le tout premier clic
        if (isFirstClick) {
            addBombsAfterFirstClick(currentId);
            isFirstClick = false;
            
            let total = square.getAttribute('data');
            if (total == 0) {
                 checkSquare(square, currentId);
                 square.classList.add('checked');
                 squaresRevealed++;
                 checkForWin();
                 return;
            }
        }

        // logique normale de creusage
        if (square.classList.contains('bomb')) {
            gameOver(square);
        } else {
            let total = square.getAttribute('data');
            
            if (total != 0) {
                square.classList.add('checked');
                square.innerHTML = total;
                if (total == 1) square.classList.add('one');
                if (total == 2) square.classList.add('two');
                if (total == 3) square.classList.add('three');
                if (total == 4) square.classList.add('four');
                squaresRevealed++;
                checkForWin(); 
                return;
            }
            checkSquare(square, currentId);
        }
        square.classList.add('checked');
        squaresRevealed++;
        checkForWin();
    }

    // fonction dédiée pour ajouter ou enlever un drapeau
    function addFlag(square) {
        if (isGameOver) return;
        // on ne peut mettre un drapeau que sur une case non révélée 
        if (!square.classList.contains('checked')) {
            if (!square.classList.contains('flag')) {
                // s'il n'y a pas de drapeau, on en met un
                square.classList.add('flag');
                square.innerHTML = '🚩';
            } else {
                // S'il y a déjà un drapeau, on l'enlève
                square.classList.remove('flag');
                square.innerHTML = '';
            }
        }
    }

    // effet de zone
    function checkSquare(square, currentId) {
        const x = parseInt(currentId) % width;
        const y = Math.floor(parseInt(currentId) / width);

        setTimeout(() => {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
                        let newId = ny * width + nx;
                        const newSquare = document.getElementById(newId);
                        // On vérifie que la case n'a pas de drapeau avant de cliquer automatiquement dessus
                        if (!newSquare.classList.contains('flag')) {
                            click(newSquare);
                        }
                    }
                }
            }
        }, 10);
    }

    // victoire
    function checkForWin() {
        if (squaresRevealed === width * width - bombAmount) {
            resultatDisplay.innerHTML = 'GAGNÉ ! BRAVO !';
            resultatDisplay.classList.add('win');
            isGameOver = true;
        }
    }

    // defaite
    function gameOver(square) {
        resultatDisplay.innerHTML = 'BOUM ! Perdu !';
        isGameOver = true;
        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '💣';
                square.classList.remove('bomb');
                square.classList.add('checked');
                square.classList.add('bomb-style');
            }
        });
    }
});