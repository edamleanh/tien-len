import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Play, Users, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { joinGame } = useGame();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!roomCode) {
        setError('Please enter a room code.');
        return;
    }
    joinGame(roomCode);
    navigate(`/game/${roomCode.toUpperCase()}`);
  };

  const handleNewGame = () => {
      navigate('/setup');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Tiến Lên
        </h1>
        <p className="text-zinc-400">Scorekeeper for your card games</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handleNewGame}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-all active:scale-95"
        >
          <Play className="w-5 h-5" />
          Create New Game
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-500">Or join existing</span>
          </div>
        </div>

        <form onSubmit={handleJoinGame} className="space-y-3">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Enter Room Code"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roomCode}
              onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError('');
              }}
            />
          </div>
          {error && <p className="text-red-500 text-sm pl-1">{error}</p>}
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!roomCode}
          >
            Join Game
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
