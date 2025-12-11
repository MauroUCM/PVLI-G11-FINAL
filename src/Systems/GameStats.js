/**
 * Sistema global de estadísticas que persiste entre partidas
 */
class GameStatsManager {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.stats = {
            // Estadísticas globales
            totalGames: 0,
            redWins: 0,
            blueWins: 0,
            
            // Estadísticas de la sesión actual de revancha
            currentStreak: {
                winner: null,
                count: 0
            },
            
            // Estadísticas de la última partida
            lastGame: {
                winner: null,
                reason: null,
                duration: '0:00',
                totalTurns: 0,
                totalShots: 0,
                hits: 0,
                resourcesCollected: 0,
                totalDamage: 0
            }
        };
    }
    
    recordGame(winner, reason, gameStats) {
        this.stats.totalGames++;
        
        if (winner === 'red') {
            this.stats.redWins++;
        } else {
            this.stats.blueWins++;
        }
        
        // Actualizar racha
        if (this.stats.currentStreak.winner === winner) {
            this.stats.currentStreak.count++;
        } else {
            this.stats.currentStreak.winner = winner;
            this.stats.currentStreak.count = 1;
        }
        
        // Guardar estadísticas de la última partida
        this.stats.lastGame = {
            winner,
            reason,
            ...gameStats
        };
    }
    
    getStats() {
        return this.stats;
    }
    
    getLastGameStats() {
        return this.stats.lastGame;
    }
    
    resetSession() {
        this.reset();
    }
}

// Instancia global única
export const GameStats = new GameStatsManager();