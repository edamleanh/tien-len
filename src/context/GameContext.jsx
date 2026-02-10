import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load game from local storage on mount
  useEffect(() => {
    const savedGameId = localStorage.getItem('tien-len-game-id');
    if (savedGameId) {
      setGameId(savedGameId);
    }
  }, []);

  // Subscribe to game updates when gameId changes
  useEffect(() => {
    if (!gameId) {
      setGameState(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, "games", gameId), (doc) => {
      setLoading(false);
      if (doc.exists()) {
        setGameState(doc.data());
      } else {
        setError("Game not found");
        setGameId(null);
        localStorage.removeItem('tien-len-game-id');
      }
    }, (err) => {
      setLoading(false);
      setError(err.message);
    });

    return () => unsubscribe();
  }, [gameId]); // Add gameId as dependency

  const createGame = async (mode, targetScore, playerNames) => {
    setLoading(true);
    setError(null);
    try {
      // transform player names to objects or just initialize scores map
      // Initial score is 0.
      const initialScores = {};
      playerNames.forEach(name => initialScores[name] = 0);

      const newGameId = Math.random().toString(36).substring(2, 6).toUpperCase();
      
      const newGame = {
        id: newGameId,
        createdAt: new Date().toISOString(),
        players: playerNames,
        mode,
        targetScore: mode === 'CHAM_DIEM' ? parseInt(targetScore) : null,
        rounds: [],
        totalScores: initialScores,
        status: 'ACTIVE' // ACTIVE, FINISHED
      };

      await setDoc(doc(db, "games", newGameId), newGame);
      setGameId(newGameId);
      localStorage.setItem('tien-len-game-id', newGameId);
    } catch (err) {
      setError(err.message);
      console.error("Error creating game:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinGame = (id) => {
    setGameId(id.toUpperCase());
    localStorage.setItem('tien-len-game-id', id.toUpperCase());
  };

  const leaveGame = () => {
    setGameId(null);
    setGameState(null);
    localStorage.removeItem('tien-len-game-id');
  };

  const addRound = async (ranks, penalties) => {
    if (!gameId || !gameState) return;

    try {
        const currentScores = { ...gameState.totalScores };
        const roundScores = {};

        // Calculate scores based on ranks
        // ranks is { "PlayerName": 1, ... }
        // mode: CHAM_DIEM (3, 2, 1, 0)
        // mode: TINH_DIEM (2, 1, -1, -2)

        const players = gameState.players;
        
        players.forEach(player => {
            const rank = ranks[player];
            let scoreChange = 0;

            if (gameState.mode === 'CHAM_DIEM') {
                if (rank === 1) scoreChange = 3;
                else if (rank === 2) scoreChange = 2;
                else if (rank === 3) scoreChange = 1;
                else scoreChange = 0;
            } else { // TINH_DIEM
                if (rank === 1) scoreChange = 2;
                else if (rank === 2) scoreChange = 1;
                else if (rank === 3) scoreChange = -1;
                else scoreChange = -2;
            }
            roundScores[player] = scoreChange;
        });

        // Apply penalties
        // penalties: [{ from: "A", to: "B", amount: 2, reason: "..." }]
        // In TINH_DIEM, usually penalties are direct transfer.
        // In CHAM_DIEM, penalties might just add to score? 
        // User rule: "nhớ thêm các luật bổ sung như bị chặt heo vào."
        // Usually Chặt Heo is separate calculation.
        // Let's assume penalties are transfers: A loses points, B gains points.

        if (penalties && penalties.length > 0) {
             penalties.forEach(p => {
                 roundScores[p.from] = (roundScores[p.from] || 0) - p.amount;
                 roundScores[p.to] = (roundScores[p.to] || 0) + p.amount;
             });
        }
        
        // Update total scores
        players.forEach(player => {
            currentScores[player] = (currentScores[player] || 0) + (roundScores[player] || 0);
        });

        // Check for win condition in CHAM_DIEM
        let status = 'ACTIVE';
        if (gameState.mode === 'CHAM_DIEM') {
             const winner = players.find(p => currentScores[p] >= gameState.targetScore);
             if (winner) {
                 status = 'FINISHED';
             }
        }

        const newRound = {
            roundNumber: gameState.rounds.length + 1,
            ranks,
            penalties: penalties || [],
            scores: roundScores,
            timestamp: new Date().toISOString()
        };

        await updateDoc(doc(db, "games", gameId), {
            rounds: arrayUnion(newRound),
            totalScores: currentScores,
            status
        });

    } catch (err) {
        setError(err.message);
        console.error("Error adding round:", err);
    }
  };

  const value = {
    gameId,
    gameState,
    loading,
    error,
    createGame,
    joinGame,
    leaveGame,
    addRound
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
