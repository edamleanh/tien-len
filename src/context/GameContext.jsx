import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, runTransaction, arrayUnion } from 'firebase/firestore';
import { calculateRoundScores } from '../lib/utils';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to sessions
  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
      
      // Auto-select active session if one exists and we don't have one selected or it matches
      const active = sessionsData.find(s => s.status === 'ACTIVE');
      if (active) {
        setActiveSession(active);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createSession = async (players, mode) => {
    // players: array of strings
    // mode: 'TARGET' | 'ZERO_SUM'
    
    const initialScores = {};
    players.forEach(p => initialScores[p] = 0);

    const newSession = {
      createdAt: serverTimestamp(),
      status: 'ACTIVE',
      mode,
      players,
      totalScores: initialScores,
      history: [] // Array of rounds
    };

    const docRef = await addDoc(collection(db, 'sessions'), newSession);
    // Logic to set active is handled by subscription, but we can set it optimistically/immediately if needed
    return docRef.id;
  };

  const endSession = async (sessionId) => {
     await updateDoc(doc(db, 'sessions', sessionId), {
       status: 'COMPLETED',
       endedAt: serverTimestamp()
     });
     setActiveSession(null);
  };

  const addRound = async (sessionId, rankings, mode) => {
    // rankings: [1st, 2nd, 3rd, 4th]
    const roundScores = calculateRoundScores(mode, rankings);
    
    // Create round object
    const roundData = {
      type: 'ROUND',
      rankings,
      scores: roundScores,
      createdAt: new Date().toISOString() // Use string for array storage
    };

    const sessionRef = doc(db, 'sessions', sessionId);

    await runTransaction(db, async (transaction) => {
      const sessionDoc = await transaction.get(sessionRef);
      if (!sessionDoc.exists()) throw "Session not found";

      const currentTotal = sessionDoc.data().totalScores || {};
      const newTotal = { ...currentTotal };

      Object.entries(roundScores).forEach(([player, score]) => {
        newTotal[player] = (newTotal[player] || 0) + score;
      });

      transaction.update(sessionRef, {
        totalScores: newTotal,
        history: arrayUnion(roundData)
      });
    });
  };

  const addPenalty = async (sessionId, fromPlayer, toPlayer, amount, reason) => {
    // amount is positive number (penalty value)
    // deduct from 'fromPlayer', add to 'toPlayer'
    
    const penaltyScores = {
      [fromPlayer]: -amount,
      [toPlayer]: amount
    };

    const penaltyData = {
      type: 'PENALTY',
      from: fromPlayer,
      to: toPlayer,
      amount,
      reason,
      scores: penaltyScores,
      createdAt: new Date().toISOString()
    };

    const sessionRef = doc(db, 'sessions', sessionId);

    await runTransaction(db, async (transaction) => {
      const sessionDoc = await transaction.get(sessionRef);
      if (!sessionDoc.exists()) throw "Session not found";

      const currentTotal = sessionDoc.data().totalScores || {};
      const newTotal = { ...currentTotal };

      newTotal[fromPlayer] = (newTotal[fromPlayer] || 0) - amount;
      newTotal[toPlayer] = (newTotal[toPlayer] || 0) + amount;

      transaction.update(sessionRef, {
        totalScores: newTotal,
        history: arrayUnion(penaltyData)
      });
    });
  };

  return (
    <GameContext.Provider value={{ activeSession, sessions, createSession, endSession, addRound, addPenalty, loading }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
