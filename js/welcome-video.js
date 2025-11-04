document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('welcomeAudio');
    const playButton = document.getElementById('playButton');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const timeDisplay = document.getElementById('timeDisplay');
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');
    let isPlaying = false;

    // Initialize audio context
    let audioContext;
    let analyser; 
    let dataArray;

    // Original image for reference
    const img = new Image();
    img.src = 'images/usethisimageweb.jpg';
    
    // Lip area coordinates for more precise mouth movement
    const lipArea = {
        x: 0.5, // Center of face
        y: 0.65, // Position of mouth
        width: 0.15, // Width of mouth area
        height: 0.08, // Height of mouth area
        upperLipOffset: 0.02, // Offset for upper lip movement
        lowerLipOffset: 0.02  // Offset for lower lip movement
    };

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };

    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 32;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Blink animation
    function blink() {
        if (!isPlaying) return;
        
        leftEye.style.transform = 'scaleY(0.1)';
        rightEye.style.transform = 'scaleY(0.1)';
        
        setTimeout(() => {
            leftEye.style.transform = 'scaleY(1)';
            rightEye.style.transform = 'scaleY(1)';
        }, 150);

        // Random interval for next blink
        const nextBlink = Math.random() * 4000 + 2000; // Between 2-6 seconds
        setTimeout(blink, nextBlink);
    }

    // Head movement
    function moveHead() {
        if (!isPlaying) return;

        const maxTilt = 2;
        const maxShift = 5;
        
        const randomTilt = (Math.random() - 0.5) * maxTilt;
        const randomShiftX = (Math.random() - 0.5) * maxShift;
        const randomShiftY = (Math.random() - 0.5) * maxShift;

        headContainer.style.transform = `translate(${randomShiftX}px, ${randomShiftY}px) rotate(${randomTilt}deg)`;

        // Update head position every 2-3 seconds
        setTimeout(moveHead, Math.random() * 1000 + 2000);
    }

    function animateMouth() {
        if (!isPlaying) return;

        // Get frequency data
        analyser.getByteFrequencyData(dataArray);
        const vocalRange = dataArray.slice(2, 6);
        const average = vocalRange.reduce((a, b) => a + b) / vocalRange.length;
        
        // Clear canvas and draw original image
        ctx.drawImage(img, 0, 0);

        // Calculate lip movement with more natural motion
        const intensity = average / 256;
        // Add slight randomness for more natural movement
        const naturalness = Math.sin(Date.now() / 100) * 0.1;
        const lipOpenAmount = (intensity * 25 + naturalness * 5); // Increased movement range

        // Get lip coordinates in pixels
        const lipX = canvas.width * lipArea.x;
        const lipY = canvas.height * lipArea.y;
        const lipW = canvas.width * lipArea.width;
        const lipH = canvas.height * lipArea.height;

        // Create a clip region around the lips
        ctx.save();
        ctx.beginPath();
        ctx.rect(lipX - lipW/2, lipY - lipH/2, lipW, lipH);
        ctx.clip();

        // Apply distortion to lip area
        const lipImageData = ctx.getImageData(lipX - lipW/2, lipY - lipH/2, lipW, lipH);
        const pixels = lipImageData.data;
        
        // Modify pixels to create opening effect
        for (let y = 0; y < lipH; y++) {
            for (let x = 0; x < lipW; x++) {
                const idx = (y * lipW + x) * 4;
                const normalizedY = y / lipH;
                
                // Calculate vertical displacement with improved natural movement
                const centerY = lipH / 2;
                const distanceFromCenter = Math.abs(y - centerY) / (lipH / 2);
                const mouthShape = Math.cos(distanceFromCenter * Math.PI);
                const displacement = mouthShape * lipOpenAmount * (y < centerY ? -1 : 1);
                
                // Add slight horizontal squeeze for more natural movement
                const horizontalSqueeze = Math.abs(displacement) * 0.2;
                const centerX = lipW / 2;
                const horizontalOffset = (x - centerX) * horizontalSqueeze;
                
                // Move pixels with both vertical and horizontal adjustment
                const sourceY = Math.max(0, Math.min(lipH - 1, y + displacement));
                const sourceX = Math.max(0, Math.min(lipW - 1, x + horizontalOffset));
                const sourceIdx = (Math.floor(sourceY) * lipW + Math.floor(sourceX)) * 4;
                
                pixels[idx] = lipImageData.data[sourceIdx];
                pixels[idx + 1] = lipImageData.data[sourceIdx + 1];
                pixels[idx + 2] = lipImageData.data[sourceIdx + 2];
                pixels[idx + 3] = lipImageData.data[sourceIdx + 3];
            }
        }

        ctx.putImageData(lipImageData, lipX - lipW/2, lipY - lipH/2);
        ctx.restore();

        requestAnimationFrame(animateMouth);
    }

    playButton.addEventListener('click', function() {
        if (!audioContext) {
            initAudioContext();
        }

        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playButton.querySelector('.play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
            ctx.drawImage(img, 0, 0); // Reset to original image
        } else {
            audio.play();
            isPlaying = true;
            playButton.querySelector('.play-icon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            animateMouth();
        }
    });

    progressBar.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });

    audio.addEventListener('timeupdate', function() {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        timeDisplay.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', function() {
        isPlaying = false;
        playButton.querySelector('.play-icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
        progressFill.style.width = '0%';
        timeDisplay.textContent = '0:00';
        // Reset mouth to natural position
        animatedMouth.style.transform = 'translateX(-50%) scaleY(1)';
    });

    // Reset mouth position when paused
    audio.addEventListener('pause', function() {
        animatedMouth.style.transform = 'translateX(-50%) scaleY(1)';
    });
});