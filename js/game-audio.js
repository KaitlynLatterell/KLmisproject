document.addEventListener('DOMContentLoaded', function() {
    // Audio setup
    const backgroundMusic = document.getElementById('background-music');
    const winSound = document.getElementById('win-sound');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    // Start background music when page loads
    backgroundMusic.volume = 0.3; // Set initial volume
    
    // Start playing immediately when page loads
    backgroundMusic.play().catch(e => {
        // If autoplay is blocked, start on first interaction
        document.addEventListener('click', function startMusic() {
            backgroundMusic.play();
            document.removeEventListener('click', startMusic);
        }, { once: true });
    });

    // Mute button functionality
    muteBtn.addEventListener('click', () => {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            muteBtn.textContent = '🔊';
        } else {
            backgroundMusic.muted = true;
            muteBtn.textContent = '🔈';
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        backgroundMusic.volume = volume;
        winSound.volume = volume;
    });

    // Stop music when leaving page
    window.addEventListener('beforeunload', () => {
        backgroundMusic.pause();
    });

    // Confetti colors matching website theme
    const confettiColors = [
        '#007bff', // Primary blue
        '#ff69b4', // Pink
        '#f8f9fa', // Light
        '#6c757d', // Gray
        '#28a745'  // Success green
    ];

    function createConfetti() {
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                // Random properties for natural movement
                const startX = Math.random() * window.innerWidth;
                const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                const angle = Math.random() * 360;
                const velocity = 3 + Math.random() * 2;
                const size = Math.random() * 10 + 5;
                
                confetti.style.left = startX + 'px';
                confetti.style.top = '-20px';
                confetti.style.backgroundColor = color;
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.animationDuration = (velocity) + 's';
                confetti.style.transform = `rotate(${angle}deg)`;
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                }, velocity * 1000);
            }, i * 50); // Stagger confetti creation
        }
    }

    // Function to handle winning
    function celebrateWin() {
        winSound.play();
        createConfetti();
    }

    // Listen for game win
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'win-modal' && 
                mutation.target.style.display === 'block') {
                celebrateWin();
            }
        });
    });

    const winModal = document.getElementById('win-modal');
    observer.observe(winModal, {
        attributes: true,
        attributeFilter: ['style']
    });
});