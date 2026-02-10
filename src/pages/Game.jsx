import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Copy, Plus, History, Trophy, AlertCircle, Edit } from 'lucide-react';
import clsx from 'clsx';
import RoundInputModal from '../components/RoundInputModal';

const Game = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { gameState, loading, error, joinGame, addRound, updateRound } = useGame();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
    // State for editing
    const [editingRoundIndex, setEditingRoundIndex] = useState(null);
    const [initialModalData, setInitialModalData] = useState(null);

    useEffect(() => {
        if (id) {
            joinGame(id);
        }
    }, [id]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(id);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleOpenAddModal = () => {
        setEditingRoundIndex(null);
        setInitialModalData(null);
        setIsModalOpen(true);
    };

    const handleEditRound = (round, actualIndex) => {
        setEditingRoundIndex(actualIndex);
        setInitialModalData({
            ranks: round.ranks,
            penalties: round.penalties
        });
        setIsModalOpen(true);
    };

    const handleSaveRound = async (ranks, penalties) => {
        if (editingRoundIndex !== null) {
            await updateRound(editingRoundIndex, ranks, penalties);
        } else {
            await addRound(ranks, penalties);
        }
        setIsModalOpen(false);
        setEditingRoundIndex(null);
        setInitialModalData(null);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-400">{error}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700"
                >
                    Go Home
                </button>
            </div>
        );
    }

    if (!gameState) return null;

    const { players, totalScores, rounds, mode, targetScore, status } = gameState;
    
    // Sort players by score for display logic (optional, maybe keep fixed order but highlight leader)
    // Let's keep fixed order to match table columns
    const topScore = Math.max(...Object.values(totalScores));
    const leadingPlayers = players.filter(p => totalScores[p] === topScore);

    return (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        Bảng Điểm
                    </h2>
                    <p className="text-xs text-zinc-500">
                        {mode === 'CHAM_DIEM' ? `Đua tới ${targetScore} điểm` : 'Tính Điểm Mỗi Ván'}
                    </p>
                </div>
                {status === 'FINISHED' && (
                    <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20 animate-pulse">
                        KẾT THÚC
                    </div>
                )}
            </div>

            {/* Scoreboard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {players.map((player) => {
                    const isLeader = totalScores[player] === topScore && rounds.length > 0;
                    return (
                        <div 
                            key={player}
                            className={clsx(
                                "relative p-4 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all",
                                isLeader 
                                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-lg shadow-yellow-900/10" 
                                    : "bg-zinc-900 border-zinc-800"
                            )}
                        >
                            {isLeader && <Trophy className="absolute -top-3 text-yellow-500 w-6 h-6 drop-shadow-lg" />}
                            <span className="text-zinc-400 text-sm font-medium truncate w-full text-center">{player}</span>
                            <span className={clsx(
                                "text-3xl font-bold font-mono tracking-tighter",
                                isLeader ? "text-yellow-400" : "text-white"
                            )}>
                                {totalScores[player]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* History Table */}
            <div className="flex-1 overflow-hidden bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 items-center justify-between flex">
                    <h3 className="font-bold flex items-center gap-2">
                        <History className="w-4 h-4 text-zinc-400" />
                        Lịch Sử Ván Đấu
                    </h3>
                    <span className="text-xs text-zinc-500">{rounds.length} ván đã chơi</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">#</th>
                                {players.map(p => (
                                    <th key={p} className="px-4 py-3 font-medium text-center">{p}</th>
                                ))}
                                <th className="px-4 py-3 font-medium w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {[...rounds].reverse().map((round) => (
                                <React.Fragment key={round.roundNumber}>
                                    <tr className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-zinc-500">
                                            {round.roundNumber}
                                        </td>
                                        {players.map(p => {
                                            const score = round.scores[p];
                                            return (
                                                <td key={p} className="px-4 py-3 text-center font-mono">
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded",
                                                        score > 0 ? "bg-green-500/10 text-green-400" :
                                                        score < 0 ? "bg-red-500/10 text-red-400" :
                                                        "text-zinc-500"
                                                    )}>
                                                        {score > 0 ? `+${score}` : score}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => handleEditRound(round, round.roundNumber - 1)}
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-all"
                                                title="Sửa Ván Đấu"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {round.penalties && round.penalties.length > 0 && (
                                        <tr className="bg-red-900/5">
                                            <td colSpan={players.length + 2} className="px-4 py-2 text-xs">
                                                <div className="flex flex-wrap gap-2">
                                                    {round.penalties.map((p, idx) => (
                                                        <div key={idx} className="flex items-center gap-1 bg-red-900/20 border border-red-900/30 text-red-300 px-2 py-1 rounded">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span className="font-bold text-green-400">{p.to}</span>
                                                            <span className="text-zinc-500">chặt</span>
                                                            <span className="font-bold">{p.from}</span>
                                                            <span className="text-zinc-400">({p.reason}: {p.amount} điểm)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {rounds.length === 0 && (
                                <tr>
                                    <td colSpan={players.length + 2} className="px-4 py-8 text-center text-zinc-500">
                                        Chưa có ván nào. Bắt đầu chơi thôi!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Action Button */}
            {status !== 'FINISHED' && (
                <button
                    onClick={handleOpenAddModal}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl shadow-blue-900/30 flex items-center justify-center transition-all active:scale-95 group z-20"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
            )}

            <RoundInputModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                players={players}
                onSave={handleSaveRound}
                initialData={initialModalData}
            />
        </div>
    );
};

export default Game;
