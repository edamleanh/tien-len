import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Play, Calendar, Trophy, ArrowRight, Loader } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import clsx from 'clsx';

const Home = () => {
  const navigate = useNavigate();
  const { joinGame } = useGame();
  const [recentGames, setRecentGames] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch last 10 games
        const q = query(collection(db, "games"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const games = [];
        querySnapshot.forEach((doc) => {
          games.push({ id: doc.id, ...doc.data() });
        });
        setRecentGames(games);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchGames();
  }, []);

  const handleContinue = (gameId) => {
      joinGame(gameId);
      navigate(`/game/${gameId}`);
  };

  const handleNewGame = () => {
      navigate('/setup');
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 max-w-lg mx-auto w-full pb-20">
      <div className="text-center space-y-2 py-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Tiến Lên
        </h1>
        <p className="text-zinc-400">Scorekeeper</p>
      </div>

      <button
        onClick={handleNewGame}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95"
      >
        <Play className="w-6 h-6 fill-current" />
        New Game
      </button>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Recent Games
        </h2>

        {loadingHistory ? (
            <div className="flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        ) : recentGames.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                No games found. Start a new one!
            </div>
        ) : (
            <div className="space-y-3">
                {recentGames.map((game) => {
                    const date = game.createdAt ? new Date(game.createdAt) : new Date();
                    const isFinished = game.status === 'FINISHED';
                    
                    // Simple summary of winner if finished, or leader if active
                    const scores = game.totalScores || {};
                    const topScore = Math.max(...Object.values(scores).length ? Object.values(scores) : [0]);
                    const leader = game.players?.find(p => scores[p] === topScore);

                    return (
                        <div 
                            key={game.id}
                            onClick={() => handleContinue(game.id)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-0.5 rounded-full border",
                                            game.mode === 'CHAM_DIEM' 
                                                ? "bg-blue-900/30 text-blue-400 border-blue-900/50" 
                                                : "bg-purple-900/30 text-purple-400 border-purple-900/50"
                                        )}>
                                            {game.mode === 'CHAM_DIEM' ? 'Chạm' : 'Tính'}
                                        </span>
                                        {isFinished && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-900/30 text-yellow-500 border border-yellow-900/50">
                                                Finished
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 font-mono">
                                        {format(date, 'MMM d, h:mm a')}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-zinc-300">
                                    Players: <span className="text-zinc-500">{game.players?.join(', ')}</span>
                                </div>
                                {leader && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        <span className="text-yellow-500 font-bold">{leader}</span>
                                        <span className="text-zinc-500">({scores[leader]} pts)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;
