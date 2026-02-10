import React, { useState, useEffect } from 'react';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function RoundInputModal({ isOpen, onClose, sessionId, players, mode }) {
  const { addRound } = useGame();
  const [rankings, setRankings] = useState(['', '', '', '']); // Stores player names for 1st, 2nd, 3rd, 4th
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setRankings(['', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  const handleSelect = (rankIndex, playerName) => {
    const newRankings = [...rankings];
    
    // If player is already selected in another rank, remove them from that rank
    const existingIndex = newRankings.indexOf(playerName);
    if (existingIndex !== -1 && existingIndex !== rankIndex) {
      newRankings[existingIndex] = '';
    }
    
    newRankings[rankIndex] = playerName;
    setRankings(newRankings);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rankings.some(r => !r)) {
      setError('Please select all 4 positions.');
      return;
    }
    
    setLoading(true);
    try {
      await addRound(sessionId, rankings, mode);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save round.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRankLabel = (index) => {
    const labels = ['1st (Nhất)', '2nd (Nhì)', '3rd (Ba)', '4th (Bét)'];
    const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-600', 'text-muted-foreground'];
    return { label: labels[index], color: colors[index] };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            Ván Mới
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {rankings.map((selectedPlayer, index) => {
            const { label, color } = getRankLabel(index);
            return (
              <div key={index} className="space-y-1">
                <label className={`text-sm font-semibold ${color}`}>
                  {label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {players.map(player => {
                    const isSelected = selectedPlayer === player;
                    const isTaken = rankings.includes(player) && !isSelected;
                    
                    return (
                      <button
                        key={player}
                        type="button"
                        onClick={() => handleSelect(index, player)}
                        disabled={isTaken}
                        className={`flex-1 min-w-[30%] text-sm py-2 px-1 rounded-md border transition-all ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary font-medium shadow-sm' 
                            : isTaken 
                              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                              : 'bg-card hover:bg-muted border-input'
                        }`}
                      >
                        {player}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Saving...' : 'Save Result'}
          </button>
        </form>
      </div>
    </div>
  );
}
