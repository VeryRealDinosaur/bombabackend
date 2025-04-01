document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('gamesContainer');
    const refreshBtn = document.getElementById('refreshBtn');
    const lastUpdatedEl = document.getElementById('lastUpdated');
    
    // Initialize Socket.io connection
    const socket = io();
    
    // Function to format time
    function formatTime(seconds) {
        if (seconds === undefined || seconds === null) return "N/A";
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Function to update last refresh time
    function updateLastRefreshTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        lastUpdatedEl.textContent = `Last updated: ${timeString}`;
    }
    
    // Function to fetch and display dashboard data
    async function fetchDashboard() {
        try {
            const response = await fetch('/api/dashboard');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            
            const games = await response.json();
            displayGames(games);
            updateLastRefreshTime();
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            gamesContainer.innerHTML = `
                <div class="no-games">
                    <p>Error loading games data. Please try again.</p>
                </div>
            `;
        }
    }
    
    // Function to display games
    function displayGames(games) {
        if (!games || games.length === 0) {
            gamesContainer.innerHTML = `
                <div class="no-games">
                    <p>No active games found. Start a new game to see it here!</p>
                </div>
            `;
            return;
        }
        
        gamesContainer.innerHTML = '';
        
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            
            // Calculate progress percentage
            const progressPercentage = game.totalModules > 0 ? 
                (game.solvedModules / game.totalModules) * 100 : 0;
            
            // Create strikes indicators
            let strikesHTML = '';
            for (let i = 0; i < 3; i++) {
                const strikeClass = i < game.strikes ? 'strike-active' : '';
                strikesHTML += `<div class="strike-indicator ${strikeClass}"></div>`;
            }
            
            // Create winner info if game is over
            let winnerHTML = '';
            if (game.gameOver) {
                if (game.winner === true) {
                    winnerHTML = `<div class="winner-info">Bomb Defused Successfully!</div>`;
                } else {
                    winnerHTML = `<div class="winner-info" style="background-color: #e74c3c;">Bomb Exploded!</div>`;
                }
            }
            
            // Generate chat messages HTML
            let chatMessagesHTML = '';
            if (game.recentMessages && game.recentMessages.length > 0) {
                game.recentMessages.forEach(msg => {
                    chatMessagesHTML += `
                        <div class="chat-message">
                            <span class="chat-sender">${msg.sender}:</span>
                            <span class="chat-text">${msg.text}</span>
                        </div>
                    `;
                });
            } else {
                chatMessagesHTML = '<div class="chat-message">No recent messages</div>';
            }
            
            gameCard.innerHTML = `
                <div class="game-header">
                    <div class="game-id">Game #${game.gameId}</div>
                    <div class="game-status ${game.gameOver ? 'game-over' : 'active'}">
                        ${game.gameOver ? 'Game Over' : 'Active'}
                    </div>
                </div>
                
                <div class="game-stats">
                    <div class="stat-item">
                        <div class="stat-label">Players</div>
                        <div class="stat-value">${game.players}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Strikes</div>
                        <div class="stat-value strikes-container">${strikesHTML}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Modules</div>
                        <div class="stat-value">${game.solvedModules}/${game.totalModules}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Time Remaining</div>
                        <div class="stat-value time-remaining">${formatTime(game.timeRemaining)}</div>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Module Progress</span>
                        <span>${progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                
                ${winnerHTML}
                
                <div class="chat-container">
                    <div class="chat-title">Recent Chat Messages</div>
                    ${chatMessagesHTML}
                </div>
            `;
            
            gamesContainer.appendChild(gameCard);
        });
    }
    
    // Initial fetch
    fetchDashboard();
    
    // Setup refresh button
    refreshBtn.addEventListener('click', fetchDashboard);
    
    // Auto refresh every 30 seconds
    setInterval(fetchDashboard, 30000);
    
    // Listen for game state updates
    socket.on('gameState', (gameState) => {
        if (gameState.type !== 'timerUpdate') {
            fetchDashboard();
        }
    });
    
    // Listen for chat updates
    socket.on('chatMessage', () => {
        fetchDashboard();
    });
    
    socket.on('chatUpdate', () => {
        fetchDashboard();
    });
});
