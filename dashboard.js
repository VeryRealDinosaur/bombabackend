// Import necessary modules
import express from 'express';
import { app, games, io } from './server.js';

// Dashboard route
app.get('/dashboard', (req, res) => {
    const dashboardData = Object.keys(games).map(gameId => {
        const game = games[gameId];
        return {
            gameId,
            players: Object.keys(game.players).length,
            solvedModules: game.solved,
            totalModules: game.modules.length,
            strikes: game.strikes,
            timeRemaining: game.timeRemaining,
            gameOver: game.gameOver,
            winner: game.winner,
            recentMessages: game.recentMessages || []
        };
    });
    res.json(dashboardData);
});

// Store recent chat messages
io.on('connection', (socket) => {
    socket.on('chatMessage', (message) => {
        const { gameId, text, sender } = message;
        
        if (games[gameId]) {
            if (!games[gameId].recentMessages) {
                games[gameId].recentMessages = [];
            }
            
            games[gameId].recentMessages.push({ sender, text });
            
            // Limit messages stored to the last 5
            if (games[gameId].recentMessages.length > 5) {
                games[gameId].recentMessages.shift();
            }
        }
    });
});
