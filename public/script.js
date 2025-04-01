async function fetchDashboard() {
    try {
        const response = await fetch('/dashboard');
        const data = await response.json();
        
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = ''; // Clear previous content
        
        data.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.innerHTML = `
                <h3>Game ID: ${game.gameId}</h3>
                <p>Players: ${game.players}</p>
                <p>Solved Modules: ${game.solvedModules} / ${game.totalModules}</p>
                <p>Strikes: ${game.strikes}</p>
                <p>Time Remaining: ${game.timeRemaining} seconds</p>
                <p>Game Over: ${game.gameOver ? 'Yes' : 'No'}</p>
                <p>Winner: ${game.winner ? 'Yes' : 'No'}</p>
                <h4>Recent Messages:</h4>
                <ul>
                    ${game.recentMessages.map(msg => `<li><b>${msg.sender}:</b> ${msg.text}</li>`).join('')}
                </ul>
                <hr>
            `;
            dashboard.appendChild(gameDiv);
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
    }
}

// Fetch dashboard every 5 seconds
setInterval(fetchDashboard, 5000);
fetchDashboard(); // Initial fetch
