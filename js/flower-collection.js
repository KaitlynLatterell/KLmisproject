// Define all available flowers
const flowers = [
    { id: 'flower1', name: 'Tulip', emoji: '🌷' },
    { id: 'flower2', name: 'Hyacinth', emoji: '🪻' },
    { id: 'flower3', name: 'Hibiscus', emoji: '🌺' },
    { id: 'flower4', name: 'Rose', emoji: '🌹' },
    { id: 'flower5', name: 'Cherry Blossom', emoji: '🌸' },
    { id: 'flower6', name: 'Blossom', emoji: '🌼' },
    { id: 'flower7', name: 'Sunflower', emoji: '🌻' },
    { id: 'flower8', name: 'Lotus', emoji: '🪷' }
];

class FlowerCollection {
    constructor() {
        this.collectedFlowers = new Set(); // Start with empty collection each time
        this.initializeScrapbook();
        this.attachEventListeners();
    }

    // Remove the loadCollection method since we don't need it anymore

    saveCollection() {
        // Just update the status without saving to localStorage
        this.updateCollectionStatus();
    }

    initializeScrapbook() {
        const container = document.getElementById('flower-collection');
        
        // Create slots for all flowers
        flowers.forEach(flower => {
            const flowerElement = document.createElement('div');
            flowerElement.className = `flower-item ${this.collectedFlowers.has(flower.id) ? 'collected' : ''}`;
            flowerElement.id = `collection-${flower.id}`;
            
            const emojiDiv = document.createElement('div');
            emojiDiv.className = 'flower-emoji';
            emojiDiv.textContent = flower.emoji;
            
            const name = document.createElement('div');
            name.className = 'flower-name';
            name.textContent = flower.name;
            
            flowerElement.appendChild(emojiDiv);
            flowerElement.appendChild(name);
            container.appendChild(flowerElement);
        });

        this.updateCollectionStatus();
    }

    updateCollectionStatus() {
        const status = document.querySelector('.collection-status');
        const collected = this.collectedFlowers.size;
        const total = flowers.length;
        
        if (collected === total) {
            status.textContent = '🎉 Congratulations! You\'ve collected all flowers! 🎉';
            status.style.color = '#28a745';
        } else {
            status.textContent = `You've collected ${collected} out of ${total} flowers!`;
        }
    }

    addNewFlower() {
        // Get uncollected flowers
        const uncollected = flowers.filter(f => !this.collectedFlowers.has(f.id));
        
        if (uncollected.length === 0) return null;

        // Randomly select a new flower
        const newFlower = uncollected[Math.floor(Math.random() * uncollected.length)];
        
        // Add to collection
        this.collectedFlowers.add(newFlower.id);
        
        // Update UI
        const flowerElement = document.getElementById(`collection-${newFlower.id}`);
        flowerElement.classList.add('collected');
        flowerElement.classList.add('new-collection');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            flowerElement.classList.remove('new-collection');
        }, 1000);

        this.saveCollection();
        return newFlower;
    }

    attachEventListeners() {
        // Listen for game wins
        const winModal = document.getElementById('win-modal');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.style.display === 'block') {
                    const newFlower = this.addNewFlower();
                    if (newFlower) {
                        // Add flower notification to win modal
                        const flowerNotification = document.createElement('p');
                        flowerNotification.className = 'flower-notification';
                        flowerNotification.textContent = `You collected a new flower: ${newFlower.name}!`;
                        winModal.querySelector('.modal-content').appendChild(flowerNotification);
                    }
                }
            });
        });

        observer.observe(winModal, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
}

// Initialize the collection system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.flowerCollection = new FlowerCollection();
});