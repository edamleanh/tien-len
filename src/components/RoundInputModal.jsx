import React, { useState, useEffect } from 'react';
import { X, Trophy, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const RoundInputModal = ({ isOpen, onClose, players, onSave, initialData }) => {
    // ranks: ordered list of player names (1st to 4th)
    const [rankedPlayers, setRankedPlayers] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [showPenaltyForm, setShowPenaltyForm] = useState(false);
    
    // Penalty form state
    const [pFrom, setPFrom] = useState('');
    const [pTo, setPTo] = useState('');
    const [pAmount, setPAmount] = useState(1);
    const [pReason, setPReason] = useState('Chặt Heo');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Pre-fill for edit mode
                const ranksMap = initialData.ranks || {};
                // Convert map { "P1": 1, "P2": 2 } to array ["P1", "P2"]
                const sortedPlayers = Object.entries(ranksMap)
                    .sort(([, rankA], [, rankB]) => rankA - rankB)
                    .map(([player]) => player);

                // Ensure all players are accounted for (in case of data issues), though usually fine
                setRankedPlayers(sortedPlayers);
                setPenalties(initialData.penalties || []);
            } else {
                // Reset for new round
                setRankedPlayers([]);
                setPenalties([]);
            }
            setShowPenaltyForm(false);
            setPFrom(players[0] || '');
            setPTo(players[1] || '');
            setPAmount(1);
            setPReason('Chặt Heo');
        }
    }, [isOpen, players, initialData]);

    if (!isOpen) return null;

    const unrankedPlayers = players.filter(p => !rankedPlayers.includes(p));

    const handleRankPlayer = (player) => {
        setRankedPlayers([...rankedPlayers, player]);
    };

    const handleUnrankPlayer = (player) => {
        setRankedPlayers(rankedPlayers.filter(p => p !== player));
    };

    const handleAddPenalty = () => {
        if (!pFrom || !pTo || pFrom === pTo) return;
        setPenalties([...penalties, { from: pFrom, to: pTo, amount: parseInt(pAmount), reason: pReason }]);
        setShowPenaltyForm(false);
    };

    const handleRemovePenalty = (index) => {
        setPenalties(penalties.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        // Must have all players ranked
        if (rankedPlayers.length !== players.length) {
            alert("Please rank all players first.");
            return;
        }

        // Convert ordered array to map: { "PlayerName": 1, ... }
        const ranksMap = {};
        rankedPlayers.forEach((p, i) => {
            ranksMap[p] = i + 1;
        });

        onSave(ranksMap, penalties);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">Kết Quả Ván Đấu</h2>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Ranking Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Xếp Hạng
                        </h3>
                        
                        <div className="space-y-2">
                            {/* Slots for 1st, 2nd, 3rd, 4th */}
                            {[0, 1, 2, 3].map((index) => {
                                const player = rankedPlayers[index];
                                return (
                                    <div 
                                        key={index}
                                        onClick={() => player && handleUnrankPlayer(player)}
                                        className={clsx(
                                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                                            player 
                                                ? "bg-zinc-800 border-zinc-700 text-white cursor-pointer hover:bg-zinc-700" 
                                                : "bg-zinc-900/50 border-zinc-800 border-dashed text-zinc-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={clsx(
                                                "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                                index === 0 ? "bg-yellow-500 text-black" :
                                                index === 1 ? "bg-zinc-400 text-black" :
                                                index === 2 ? "bg-orange-700 text-white" :
                                                "bg-zinc-800 text-zinc-400"
                                            )}>
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{player || "Chọn người chơi"}</span>
                                        </div>
                                        {player && <X className="w-4 h-4 text-zinc-500" />}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {unrankedPlayers.length > 0 && (
                            <div className="pt-2">
                                <p className="text-xs text-zinc-500 mb-2">Chọn thứ hạng tiếp theo:</p>
                                <div className="flex flex-wrap gap-2">
                                    {unrankedPlayers.map(player => (
                                        <button
                                            key={player}
                                            onClick={() => handleRankPlayer(player)}
                                            className="px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors"
                                        >
                                            {player}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Penalties Section */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Phạt / Thưởng
                            </h3>
                            {!showPenaltyForm && (
                                <button 
                                    onClick={() => setShowPenaltyForm(true)}
                                    className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                >
                                    <Plus className="w-3 h-3" /> Thêm
                                </button>
                            )}
                        </div>

                        {penalties.length > 0 && (
                            <div className="space-y-2">
                                {penalties.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-red-900/10 border border-red-900/30 rounded-lg text-sm">
                                        <div>
                                            <span className="font-bold text-green-400">{p.to}</span>
                                            <span className="text-zinc-500 mx-1">chặt</span>
                                            <span className="font-bold text-red-400">{p.from}</span>
                                            <div className="text-xs text-zinc-500 mt-0.5">{p.reason} ({p.amount} điểm)</div>
                                        </div>
                                        <button onClick={() => handleRemovePenalty(i)} className="p-1 text-zinc-500 hover:text-red-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showPenaltyForm && (
                            <div className="p-3 bg-zinc-800/50 rounded-xl space-y-3 border border-zinc-700">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Người Chặt</label>
                                        <select 
                                            value={pTo} 
                                            onChange={(e) => setPTo(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                        >
                                            <option value="" disabled>Chọn</option>
                                            {players.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Người Bị Chặt</label>
                                        <select 
                                            value={pFrom} 
                                            onChange={(e) => setPFrom(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                        >
                                            <option value="" disabled>Chọn</option>
                                            {players.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Điểm</label>
                                        <select 
                                            value={pAmount} 
                                            onChange={(e) => setPAmount(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                        >
                                            <option value="1">1 điểm</option>
                                            <option value="2">2 điểm</option>
                                            <option value="3">3 điểm</option>
                                            <option value="4">4 điểm</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Lý do</label>
                                        <select 
                                            value={pReason} 
                                            onChange={(e) => setPReason(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                                        >
                                            <option value="Chặt Heo">Chặt Heo</option>
                                            <option value="Chặt Đôi Thông">Chặt Đôi Thông</option>
                                            <option value="Chặt Tứ Quý">Chặt Tứ Quý</option>
                                            <option value="Thối Heo">Thối Heo</option>
                                            <option value="Cóng">Cóng</option>
                                            <option value="Other">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button 
                                        onClick={() => setShowPenaltyForm(false)}
                                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={handleAddPenalty}
                                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                                    >
                                        Thêm Phạt
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800">
                    <button
                        onClick={handleSave}
                        className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                    >
                        Lưu Kết Quả
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoundInputModal;
