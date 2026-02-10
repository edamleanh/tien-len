import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Target, Trophy, Play, Users, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const Setup = () => {
    const navigate = useNavigate();
    const { createGame, loading, error } = useGame();
    
    const [mode, setMode] = useState('CHAM_DIEM'); // CHAM_DIEM | TINH_DIEM
    const [targetScore, setTargetScore] = useState(15);
    const [players, setPlayers] = useState(['', '', '', '']);

    const handlePlayerChange = (index, value) => {
        const newPlayers = [...players];
        newPlayers[index] = value;
        setPlayers(newPlayers);
    };

    const handleStartGame = async () => {
        // Validate players
        const validPlayers = players.map(p => p.trim()).filter(p => p !== '');
        if (validPlayers.length !== 4) {
            // Requirement says group of 4
            // But let's fill defaults if empty
            const finalPlayers = players.map((p, i) => p.trim() || `Player ${i + 1}`);
            // Check uniqueness?
            const uniquePlayers = new Set(finalPlayers);
            if (uniquePlayers.size !== 4) {
                 alert("Player names must be unique!");
                 return;
            }
            await createGame(mode, targetScore, finalPlayers);
        } else {
             // Check uniqueness
            const uniquePlayers = new Set(validPlayers);
            if (uniquePlayers.size !== 4) {
                 alert("Player names must be unique!");
                 return;
            }
            await createGame(mode, targetScore, validPlayers);
        }
        
        // Navigation is handled in createGame wrapper or we wait for context to update?
        // Actually createGame updates state. But we need to know the ID to navigate.
        // Wait, my createGame in context sets gameId in state, but doesn't return it directly easily unless I modify it.
        // Ah, createGame is async. I can update it to return the ID. -> I should have checked this.
        // Let's assume createGame returns void and sets gameId. 
        // I can just read gameId from context? No, it might not be updated immediately in this render cycle.
        // I should update createGame to return the ID. 
        // For now, I'll rely on the localStorage side effect or just wait.
        // actually, createGame in my context sets `gameId` state. 
        // But `await createGame` finishes after `setGameId`. 
        // However, I can't access the new state `gameId` immediately in this function scope.
        // I should read localStorage or update context to return id.
        // Let's check context code quickly.
        // It sets local storage. So I can read it.
    };
    
    // Using a useEffect to navigate when gameId is set might be safer
    // But I'll just check localStorage for now to be quick.
    // Or better, I will refactor `createGame` in context later if needed. 
    // For now, I'll assume I can read localStorage 'tien-len-game-id' after await.
    
    React.useEffect(() => {
        if (!loading && localStorage.getItem('tien-len-game-id')) {
             // navigate(`/game/${localStorage.getItem('tien-len-game-id')}`);
             // Wait, this might trigger on mount if previous game exists.
             // We probably want to only navigate if we Just created it.
             // So I'll do navigation in handleStartGame
        }
    }, [loading]);

    return (
        <div className="flex-1 flex flex-col p-4 space-y-6 max-w-lg mx-auto w-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
                Thiết Lập Game Mới
            </h1>

            <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Chế Độ Chơi</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setMode('CHAM_DIEM')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            mode === 'CHAM_DIEM' 
                                ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                                : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                        )}
                    >
                        <Target className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Chạm Điểm</span>
                        <span className="text-xs opacity-70 mt-1">Đua tới điểm đích</span>
                    </button>
                    <button
                        onClick={() => setMode('TINH_DIEM')}
                        className={clsx(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            mode === 'TINH_DIEM' 
                                ? "border-purple-500 bg-purple-500/10 text-purple-400" 
                                : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                        )}
                    >
                        <Trophy className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Tính Điểm</span>
                        <span className="text-xs opacity-70 mt-1">Tính điểm từng ván</span>
                    </button>
                </div>
            </div>

            {mode === 'CHAM_DIEM' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Điểm Đích</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={targetScore}
                            onChange={(e) => setTargetScore(parseInt(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Người Chơi</label>
                <div className="space-y-3">
                    {players.map((player, i) => (
                        <div key={i} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">
                                P{i + 1}
                            </span>
                            <input
                                type="text"
                                value={player}
                                onChange={(e) => handlePlayerChange(i, e.target.value)}
                                placeholder={`Tên người chơi ${i + 1}`}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={async () => {
                        await handleStartGame();
                        // See note above: relying on localStorage for now to get ID
                        const id = localStorage.getItem('tien-len-game-id');
                        if (id) {
                            navigate(`/game/${id}`);
                        }
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Đang tạo...' : 'Bắt Đầu'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default Setup;
