import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus } from 'lucide-react';
import NewGameModal from './NewGameModal';

export default function Dashboard() {
  const { activeSession, sessions } = useGame();
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 gap-6 relative pb-20">
      <header className="pt-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Scorekeeper</h1>
        <p className="text-muted-foreground text-lg">Tiến Lên</p>
      </header>
      
      {/* Active Session Banner */}
      {activeSession && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Active Game</span>
            <span className="text-xs text-muted-foreground">
              {activeSession.createdAt?.toDate().toLocaleDateString()}
            </span>
          </div>
          <p className="font-medium text-lg mb-4">
             vs {activeSession.players.slice(1).join(', ')}...
          </p>
          <button className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
            Continue Game
          </button>
        </div>
      )}

      {/* History List */}
      <div>
        <h2 className="text-xl font-bold mb-4">History</h2>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No games played yet.</p>
          ) : (
             sessions.map(session => (
               <div key={session.id} className="bg-card/50 border border-border/50 p-4 rounded-lg flex justify-between items-center">
                 <div>
                   <p className="font-medium">{new Date(session.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                   <p className="text-sm text-muted-foreground ml-2">{session.mode === 'TARGET' ? 'Target' : 'Zero Sum'}</p>
                 </div>
                 <div className="text-right">
                    <span className={`inline-block w-2 h-2 rounded-full ${session.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:absolute md:bottom-6 md:right-0">
        <button 
          onClick={() => setIsNewGameOpen(true)}
          className="bg-primary text-primary-foreground h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="New Game"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      <NewGameModal isOpen={isNewGameOpen} onClose={() => setIsNewGameOpen(false)} />
    </div>
  );
}
