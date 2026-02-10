import React, { useState } from 'react';
import { X, Users, Trophy, Percent } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

export default function NewGameModal({ isOpen, onClose }) {
  const { createSession } = useGame();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(['', '', '', '']);
  const [mode, setMode] = useState('TARGET'); // TARGET | ZERO_SUM
  const [loading, setLoading] = useState(false);

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Fill empty names
    const finalPlayers = players.map((p, i) => p.trim() || `Player ${i + 1}`);
    
    try {
      const sessionId = await createSession(finalPlayers, mode);
      onClose();
      navigate(`/game/${sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Game</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Players */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users size={16} /> Players
            </label>
            <div className="grid grid-cols-2 gap-3">
              {players.map((p, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Player ${i + 1}`}
                  value={p}
                  onChange={(e) => handlePlayerChange(i, e.target.value)}
                  className="w-full bg-input/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Game Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('TARGET')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  mode === 'TARGET' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-card border-input hover:bg-muted'
                }`}
              >
                <Trophy size={20} />
                <span className="text-sm font-medium">Target Score</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('ZERO_SUM')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                  mode === 'ZERO_SUM' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-card border-input hover:bg-muted'
                }`}
              >
                <Percent size={20} />
                <span className="text-sm font-medium">Zero Sum</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === 'TARGET' 
                ? 'Race to a target score. Points: +3, +2, +1, 0.' 
                : 'Winner takes all. Points format: +2, +1, -1, -2.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Creating...' : 'Start Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
