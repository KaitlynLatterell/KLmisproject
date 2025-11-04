class MemoryGame {
    constructor() {
        this.cards = [];
        this.emojis = ['🌷','🌺','🪻','🌹','🌼','🌸','🌻','🪷'];
        this.moves = 0;
        this.matches = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.timer = null;
        this.seconds = 0;
        this.bestScore = localStorage.getItem('bestScore') || Infinity;
        
        // DOM elements
        this.gameGrid = document.querySelector('.game-grid');
        this.movesDisplay = document.getElementById('moves');
        this.timeDisplay = document.getElementById('time');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.modal = document.getElementById('win-modal');
        this.finalMovesDisplay = document.getElementById('final-moves');
        this.finalTimeDisplay = document.getElementById('final-time');
        
        // Bind event listeners
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('play-again').addEventListener('click', () => {
            this.modal.style.display = 'none';
            this.startGame();
        });
        
        // Initialize
        this.updateBestScore();
        this.startGame();
    }

    startGame() {
        this.resetGame();
        this.createCards();
        this.startTimer();
    }

    resetGame() {
        this.moves = 0;
        this.matches = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.seconds = 0;
        this.updateMovesDisplay();
        this.updateTimeDisplay();
        if (this.timer) clearInterval(this.timer);
        this.gameGrid.innerHTML = '';
    }

    createCards() {
        const cardPairs = [...this.emojis, ...this.emojis];
        this.cards = cardPairs
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => this.createCardElement(emoji, index));
        
        this.cards.forEach(card => this.gameGrid.appendChild(card));
    }

    createCardElement(emoji, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-front">❔</div>
            <div class="card-back">${emoji}</div>
        `;
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        
        card.addEventListener('click', () => this.flipCard(card));
        return card;
    }

    flipCard(card) {
        if (this.isLocked || this.flippedCards.includes(card) || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMovesDisplay();
            this.isLocked = true;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.emoji === card2.dataset.emoji;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matches++;

        if (this.matches === this.emojis.length) {
            this.handleWin();
        }

        this.resetTurn();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.resetTurn();
        }, 1000);
    }

    resetTurn() {
        this.flippedCards = [];
        this.isLocked = false;
    }

    handleWin() {
        clearInterval(this.timer);
        
        if (this.moves < this.bestScore) {
            this.bestScore = this.moves;
            localStorage.setItem('bestScore', this.moves);
            this.updateBestScore();
        }

        this.finalMovesDisplay.textContent = this.moves;
        this.finalTimeDisplay.textContent = this.formatTime(this.seconds);
        setTimeout(() => {
            this.modal.style.display = 'block';
        }, 500);
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.seconds = 0;
        this.updateTimeDisplay();
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateTimeDisplay();
        }, 1000);
    }

    updateMovesDisplay() {
        this.movesDisplay.textContent = this.moves;
    }

    updateTimeDisplay() {
        this.timeDisplay.textContent = this.formatTime(this.seconds);
    }

    updateBestScore() {
        this.bestScoreDisplay.textContent = this.bestScore === Infinity ? '-' : this.bestScore;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
