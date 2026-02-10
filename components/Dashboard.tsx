
import React from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Board from './Board';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const handleSignOut = () => {
    signOut(auth).catch((err) => console.error('Error signing out:', err));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          NexAuth
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </nav>

      <main className="max-w-4xl mx-auto space-y-12">
        {/* User Profile Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                Welcome, {user.displayName || 'Explorer'}
              </h2>
              <p className="text-slate-400 text-sm mb-4">{user.email}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Authenticated
              </div>
            </div>
          </div>
        </section>

        {/* Board Section */}
        <section>
          <Board user={user} />
        </section>

        {/* Footer Info */}
        <div className="p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-slate-800 rounded-2xl text-center">
          <p className="text-slate-400 text-sm max-w-md mx-auto italic">
            "Your ideas are safe here. Posts are stored in real-time using Firebase Cloud Firestore."
          </p>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto text-center mt-12 text-slate-600 text-sm">
        &copy; 2024 NexAuth Community. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
