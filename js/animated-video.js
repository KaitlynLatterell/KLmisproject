class AnimatedVideo {
    constructor() {
        this.canvas = document.getElementById('animationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new Audio('converted_audio.mp3');
        this.isPlaying = false;
        this.frame = 0;
        this.lastTime = 0;
        this.fpsInterval = 1000 / 30; // 30fps

        // Animation keyframes for mouth positions
        this.mouthPositions = {
            closed: { y: 0.65, height: 0.02 },
            halfOpen: { y: 0.63, height: 0.04 },
            open: { y: 0.62, height: 0.06 }
        };

        this.setupCanvas();
        this.loadImage();
        this.setupControls();
        this.setupAudioAnalysis();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    async loadImage() {
        this.image = new Image();
        this.image.src = 'images/usethisimageweb.jpg';
        await new Promise(resolve => this.image.onload = resolve);
        this.drawFrame();
        
        // Pre-load the audio to ensure it's ready
        await new Promise(resolve => {
            this.audio.addEventListener('loadeddata', resolve);
            this.audio.load();
        });
    }

    setupControls() {
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFilled = document.querySelector('.progress-filled');
        this.timeDisplay = document.querySelector('.time-display');

        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleEnded());
    }

    setupAudioAnalysis() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(this.audio);
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        this.analyser = analyser;
        this.audioData = new Uint8Array(analyser.frequencyBinCount);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    async play() {
        await this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.classList.add('playing');
        this.animate();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.classList.remove('playing');
    }

    seek(e) {
        const pos = (e.pageX - this.progressBar.offsetLeft) / this.progressBar.offsetWidth;
        this.audio.currentTime = pos * this.audio.duration;
    }

    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFilled.style.width = `${percent}%`;
        this.timeDisplay.textContent = `${this.formatTime(this.audio.currentTime)} / ${this.formatTime(this.audio.duration)}`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    handleEnded() {
        this.isPlaying = false;
        this.playPauseBtn.classList.remove('playing');
        cancelAnimationFrame(this.animationFrame);
    }

    getAudioLevel() {
        this.analyser.getByteFrequencyData(this.audioData);
        return Math.max(...Array.from(this.audioData)) / 255;
    }

    animate(timestamp = 0) {
        if (!this.isPlaying) return;

        if (timestamp - this.lastTime >= this.fpsInterval) {
            this.lastTime = timestamp;
            this.drawFrame();
        }

        this.animationFrame = requestAnimationFrame(t => this.animate(t));
    }

    drawFrame() {
        const audioLevel = this.isPlaying ? this.getAudioLevel() : 0;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw image
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        
        // Enhanced mouth animation parameters specifically tuned for usethisimageweb.jpg
        const mouthCenter = {
            x: this.canvas.width * 0.5,
            y: this.canvas.height * 0.68  // Adjusted for this specific image
        };
        
        // Calculate mouth dimensions based on audio level
        const mouthSize = {
            width: this.canvas.width * 0.12,  // Slightly smaller width
            height: this.canvas.height * (0.01 + audioLevel * 0.04)  // More subtle height variation
        };

        // Draw animated mouth with enhanced styling
        this.ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';  // Slightly transparent dark color
        this.ctx.beginPath();
        
        // Create a more natural mouth shape
        this.ctx.ellipse(
            mouthCenter.x,
            mouthCenter.y - (audioLevel * 5),  // Subtle upward movement when speaking
            mouthSize.width,
            mouthSize.height,
            0,
            0,
            Math.PI * 2
        );
        
        this.ctx.fill();
        
        // Add a subtle shadow effect
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetY = 2;
    }

    // Enhanced audio level processing for smoother animation
    getAudioLevel() {
        this.analyser.getByteFrequencyData(this.audioData);
        
        // Calculate a weighted average of the frequency data
        const length = this.audioData.length;
        const weightedSum = this.audioData.reduce((sum, value, index) => {
            // Give more weight to mid-range frequencies
            const weight = Math.sin((index / length) * Math.PI);
            return sum + (value * weight);
        }, 0);
        
        // Smooth the audio level for more natural movement
        const smoothedLevel = (weightedSum / (length * 255)) * 0.8;
        return Math.min(Math.max(smoothedLevel, 0), 1);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimatedVideo();
});