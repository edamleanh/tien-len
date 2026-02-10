import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ChevronLeft, Plus, Gavel, Trophy, History } from 'lucide-react';
import RoundInputModal from './RoundInputModal';
import PenaltyModal from './PenaltyModal';
import { POINTS } from '../lib/utils';

export default function Scoreboard() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, endSession } = useGame();
  
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);

  // Find session data from context (which subscribes to all sessions)
  // In a larger app, we might want a specific subscription here, but this works for personal use
  const session = sessions.find(s => s.id === sessionId);

  const parsedPlayers = useMemo(() => {
    if (!session) return [];
    
    // Create array of objects for easier sorting/display
    return session.players.map(name => ({
      name,
      score: session.totalScores[name] || 0
    })).sort((a, b) => b.score - a.score); // Sort by highest score active
  }, [session]);

  if (!session) {
    return <div className="p-8 text-center text-muted-foreground">Loading session...</div>;
  }

  const isTargetMode = session.mode === 'TARGET';

  // Sort history newest first
  const history = [...(session.history || [])].reverse();

  return (
    <div className="flex flex-col flex-1 h-full relative">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pt-6">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
        >
          <ChevronLeft />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{session.mode === 'TARGET' ? 'Target Score' : 'Zero Sum'}</h1>
          <p className="text-xs text-muted-foreground">
            {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Players Grid (Ranked) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {parsedPlayers.map((player, index) => (
          <div 
            key={player.name}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all
              ${index === 0 ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border'}
            `}
          >
            {index === 0 && (
              <div className="absolute -top-3 bg-yellow-500 text-white p-1 rounded-full shadow-sm">
                <Trophy size={14} fill="currentColor" />
              </div>
            )}
            <span className={`text-3xl font-bold mb-1 ${player.score < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {player.score > 0 ? '+' : ''}{player.score}
            </span>
            <span className="text-sm font-medium text-muted-foreground truncate w-full text-center">
              {player.name}
            </span>
          </div>
        ))}
      </div>

      {/* Recent History (Scrollable) */}
      <div className="flex-1 overflow-auto min-h-0 mb-20 -mx-4 px-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
          <History size={14} /> Activity Log
        </h3>
        <div className="space-y-3 pb-4">
          {history.length === 0 ? (
             <p className="text-sm text-muted-foreground italic text-center py-4">No rounds played yet.</p>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="bg-card/50 border border-border/50 p-3 rounded-lg text-sm">
                {item.type === 'ROUND' ? (
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-primary">Round {history.length - idx}</span>
                    <div className="text-right text-muted-foreground text-xs space-y-0.5">
                      {item.rankings.map((p, r) => (
                         <div key={r}>{r+1}. {p} ({POINTS[session.mode]?.[r] ?? 0})</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-destructive">
                    <span className="font-medium flex items-center gap-1">
                      <Gavel size={12} /> {item.reason}
                    </span>
                    <div className="text-right text-xs">
                      <span className="block text-destructive">{item.from} (-{item.amount})</span>
                      <span className="block text-green-500">{item.to} (+{item.amount})</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card/90 backdrop-blur-md border border-border shadow-xl p-2 rounded-2xl z-40">
        <button
          onClick={() => setIsPenaltyModalOpen(true)}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-destructive/10 text-destructive transition-colors gap-1"
        >
          <Gavel size={22} />
          <span className="text-[10px] font-bold uppercase">Penalty</span>
        </button>

        <button
          onClick={() => setIsRoundModalOpen(true)}
          className="flex flex-col items-center justify-center w-20 h-20 -mt-8 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={32} />
        </button>

        <button
           onClick={() => {
             if (window.confirm("End this session?")) {
               endSession(sessionId);
               navigate('/');
             }
           }}
           className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors gap-1"
        >
          <div className="w-5 h-5 border-2 border-current rounded-sm" />
          <span className="text-[10px] font-bold uppercase">End</span>
        </button>
      </div>

      {/* Modals */}
      <RoundInputModal
        isOpen={isRoundModalOpen}
        onClose={() => setIsRoundModalOpen(false)}
        sessionId={sessionId}
        players={session.players}
        mode={session.mode}
      />

      <PenaltyModal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        sessionId={sessionId}
        players={session.players}
      />
    </div>
  );
}


