import React, { useState, useEffect } from 'react';
import { X, Gavel, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function PenaltyModal({ isOpen, onClose, sessionId, players }) {
  const { addPenalty } = useGame();
  const [fromPlayer, setFromPlayer] = useState('');
  const [toPlayer, setToPlayer] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Thối Heo');
  const [presets] = useState([
    { label: 'Thối Heo Đen', value: 1 },
    { label: 'Thối Heo Đỏ', value: 2 },
    { label: 'Thối 3 Đôi Thông', value: 3 },
    { label: 'Thối Tứ Quý', value: 4 },
    { label: 'Cóng', value: 4 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFromPlayer('');
      setToPlayer('');
      setAmount('');
      setReason('Penalty');
    }
  }, [isOpen]);

  const handlePreset = (preset) => {
    setAmount(preset.value);
    setReason(preset.label);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromPlayer || !toPlayer || !amount) return;
    
    if (fromPlayer === toPlayer) {
      alert("From and To players cannot be the same");
      return;
    }

    setLoading(true);
    try {
      await addPenalty(sessionId, fromPlayer, toPlayer, Number(amount), reason);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gavel size={20} className="text-destructive" />
            Phạt Nóng
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* From Player */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-destructive">Bị Phạt (-)</label>
              <select 
                value={fromPlayer} 
                onChange={e => setFromPlayer(e.target.value)}
                className="w-full bg-input/50 border border-input rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Select...</option>
                {players.map(p => (
                  <option key={p} value={p} disabled={p === toPlayer}>{p}</option>
                ))}
              </select>
            </div>

            {/* To Player */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-500">Được Nhận (+)</label>
              <select 
                value={toPlayer} 
                onChange={e => setToPlayer(e.target.value)}
                className="w-full bg-input/50 border border-input rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Select...</option>
                {players.map(p => (
                  <option key={p} value={p} disabled={p === fromPlayer}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount and Reason */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Lý do & Điểm</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    reason === p.label && Number(amount) === p.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  {p.label} ({p.value})
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Lý do"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="flex-1 bg-input/50 border border-input rounded-md px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                placeholder="Điểm"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-20 bg-input/50 border border-input rounded-md px-3 py-2 text-sm"
                required
                min="1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-destructive text-destructive-foreground font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Processing...' : 'Apply Penalty'}
          </button>
        </form>
      </div>
    </div>
  );
}
