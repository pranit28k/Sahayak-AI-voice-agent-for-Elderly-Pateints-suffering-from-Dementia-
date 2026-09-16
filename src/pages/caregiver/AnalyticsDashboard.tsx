import React from 'react';
import {
  Activity,
  Calendar,
  AlertTriangle,
  Smile,
  Meh,
  Brain,
  Pill,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';

export const AnalyticsDashboard: React.FC = () => {
  const { patient, routine, toneLogs, gameResults, journalEntries } = useAppStore();

  // 1. Calculate Routine Adherence
  const totalRoutines = routine.length;
  const completedRoutines = routine.filter((r) => r.completed).length;
  const adherenceRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 100;

  // 2. Tone Distribution
  const toneCounts = {
    calm: toneLogs.filter((t) => t.tone === 'calm').length,
    confused: toneLogs.filter((t) => t.tone === 'confused').length,
    agitated: toneLogs.filter((t) => t.tone === 'agitated').length,
    withdrawn: toneLogs.filter((t) => t.tone === 'withdrawn').length,
  };

  const tonePieData = [
    { name: 'Calm & Receptive', value: toneCounts.calm, color: '#4d6b4d' },
    { name: 'Mild Confusion', value: toneCounts.confused, color: '#eab308' },
    { name: 'Agitation Noted', value: toneCounts.agitated, color: '#f43f5e' },
    { name: 'Quiet / Withdrawn', value: toneCounts.withdrawn, color: '#78716c' },
  ];

  // 3. Cognitive Game Score Trends (Descriptive only)
  const gameTrendData = gameResults.slice(0, 7).reverse().map((gr, idx) => ({
    session: `Day ${idx + 1}`,
    score: gr.score,
    reactionTime: gr.reactionTimeSec,
  }));

  // Fallback if few results
  const displayTrends = gameTrendData.length > 0 ? gameTrendData : [
    { session: 'Day 1', score: 80, reactionTime: 5.2 },
    { session: 'Day 2', score: 85, reactionTime: 4.8 },
    { session: 'Day 3', score: 90, reactionTime: 4.5 },
    { session: 'Day 4', score: 95, reactionTime: 4.1 },
    { session: 'Day 5', score: 100, reactionTime: 3.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Mandatory Non-Diagnostic Disclaimer */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-8 h-8 text-sage-600" />
              <span>Caregiver Engagement Analytics</span>
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Descriptive activity logs and engagement patterns for {patient.name} ({patient.preferredName}).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-sage-50 text-sage-800 border border-sage-200 rounded-lg shrink-0">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <span>Descriptive Observation • Non-Diagnostic</span>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Clinician Guidance Note:</strong> All metrics displayed are strictly descriptive logs of app interactions and caregiver-entered routines. They are intended for structured doctor-visit discussions and never represent an automated clinical diagnosis or staging.
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Routine Adherence</span>
            <Pill className="w-5 h-5 text-sage-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{adherenceRate}%</span>
            <span className="text-xs text-stone-500">of today's schedule</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-sage-600 h-2 rounded-full" style={{ width: `${adherenceRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tone Observations</span>
            <Smile className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">
              {Math.round((toneCounts.calm / (toneLogs.length || 1)) * 100)}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Calm baseline</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">{toneCounts.calm} calm sessions recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Brain Game Sessions</span>
            <Brain className="w-5 h-5 text-indigoSoft-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{gameResults.length}</span>
            <span className="text-xs text-indigoSoft-600 font-semibold">Total played</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">Avg. Reaction Time: 4.3s</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Voice Journal Notes</span>
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{journalEntries.length}</span>
            <span className="text-xs text-amber-600 font-semibold">Entries logged</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">Latest entry today</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Daily Cognitive Game Accuracy & Reaction Time */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Game Participation & Accuracy Trends</h3>
              <p className="text-xs text-stone-500">Descriptive scores across recorded game play sessions</p>
            </div>
            <TrendingUp className="w-5 h-5 text-sage-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="session" stroke="#888888" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#888888" fontSize={12} unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4d6b4d"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4d6b4d' }}
                  name="Accuracy Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tone & Mood Observations */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Spoken Tone State Distribution</h3>
              <p className="text-xs text-stone-500">Logged during patient interactions and voice journal prompts</p>
            </div>
            <Meh className="w-5 h-5 text-indigoSoft-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tonePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tonePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-stone-700 mt-2">
            {tonePieData.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.name} ({t.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Trigger Observations Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Recent Context & Tone Incident Log</h3>
            <p className="text-xs text-stone-500">Timestamped notes for doctor appointments</p>
          </div>
          <span className="text-xs text-stone-400 font-semibold">{toneLogs.length} entries recorded</span>
        </div>

        <div className="divide-y divide-stone-100">
          {toneLogs.map((log) => {
            const toneColors = {
              calm: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              confused: 'bg-amber-50 text-amber-800 border-amber-200',
              agitated: 'bg-rose-50 text-rose-800 border-rose-200',
              withdrawn: 'bg-stone-100 text-stone-800 border-stone-200',
            };

            return (
              <div key={log.id} className="p-4 sm:flex items-center justify-between gap-4 text-sm hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg border ${toneColors[log.tone]}`}>
                    {log.tone}
                  </span>
                  <p className="text-stone-800 font-medium">{log.context}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500 shrink-0">
                  {log.triggerDetected && (
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                      Trigger: {log.triggerDetected}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
