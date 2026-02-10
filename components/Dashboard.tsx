
import React from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase.ts';
import Board from './Board.tsx';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const handleSignOut = () => {
    signOut(auth).catch((err) => console.error('Error signing out:', err));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-10 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="font-black text-white">N</span>
          </div>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            NexAuth
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-slate-700 rounded-xl text-sm font-semibold transition-all"
        >
          Sign Out
        </button>
      </nav>

      <main className="max-w-4xl mx-auto space-y-10">
        {/* User Profile Summary */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-500/20 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-950 border-4 border-slate-950 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black text-white mb-1">
                Hello, {user.displayName || 'Friend'}
              </h2>
              <p className="text-slate-400 text-sm font-medium mb-4">{user.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                Trusted Contributor
              </div>
            </div>
          </div>
        </section>

        {/* Board Section */}
        <section>
          <Board user={user} />
        </section>

        {/* Informational Footer */}
        <div className="p-8 bg-slate-900/20 border border-slate-800/50 rounded-3xl text-center">
          <p className="text-slate-500 text-sm max-w-md mx-auto italic leading-relaxed">
            "Every post is a piece of community wisdom. Powered by Real-time Cloud Firestore synchronization."
          </p>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto text-center py-10 text-slate-700 text-xs font-medium uppercase tracking-[0.2em]">
        &copy; 2024 NexAuth Ecosystem
      </footer>
    </div>
  );
};

export default Dashboard;
