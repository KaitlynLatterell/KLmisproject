document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('umd-video');
    const playButton = document.getElementById('play-button');
    const videoWrapper = document.querySelector('.video-wrapper');

    if (video && playButton) {
        // Ensure video is loaded
        video.load();

        // Initialize video state
        let isFirstPlay = true;

        // Handle custom play button click
        playButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isFirstPlay) {
                isFirstPlay = false;
                video.controls = true;
            }
            
            if (video.paused) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            videoWrapper.classList.add('playing');
                        })
                        .catch(error => {
                            console.log("Video playback error:", error);
                            // Provide user feedback if needed
                        });
                }
            }
        });

        // Handle video state changes
        video.addEventListener('play', function() {
            videoWrapper.classList.add('playing');
        });

        video.addEventListener('pause', function() {
            videoWrapper.classList.remove('playing');
        });

        video.addEventListener('ended', function() {
            videoWrapper.classList.remove('playing');
            isFirstPlay = true;
            video.controls = false;
            video.load(); // Reset to poster frame
        });

        // Handle video errors
        video.addEventListener('error', function(e) {
            console.log("Video error:", video.error);
            // You could add user-friendly error messaging here
        });

        // Ensure video is ready to play
        video.addEventListener('loadedmetadata', function() {
            playButton.style.display = 'flex';
        });

        // Initially hide native controls until first play
        video.controls = false;
    }
});