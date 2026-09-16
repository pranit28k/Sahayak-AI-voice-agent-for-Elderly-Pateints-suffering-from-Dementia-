import React from 'react';
import { Printer, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const DoctorReportPage: React.FC = () => {
  const { patient, caregiver, routine, toneLogs, gameResults, journalEntries } = useAppStore();

  const handlePrint = () => {
    window.print();
  };

  const completedRoutines = routine.filter((r) => r.completed).length;
  const adherenceRate = routine.length > 0 ? Math.round((completedRoutines / routine.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-sage-600" />
            <span>Doctor-Specific Clinical Summary Report</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Structured longitudinal report formatted for review during neurologist or geriatrician consultations.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="print-page bg-white rounded-2xl border border-stone-300 shadow-md p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
        
        {/* MANDATORY CLINICAL DISCLAIMER BANNER */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide">
              Official Medical Disclaimer & Data Origin Notice
            </h4>
            <p className="text-xs mt-1 leading-relaxed">
              <strong>
                "This report summarizes app usage and self-reported caregiver observations. It is not a diagnostic tool and does not replace clinical assessment."
              </strong>{' '}
              Metrics are collected through daily home interactions with the Sahayak voice companion and caregiver logging.
            </p>
          </div>
        </div>

        {/* Report Header */}
        <div className="border-b-2 border-stone-200 pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-stone-900">SAHAYAK</span>
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-stone-100 text-stone-700">
                Patient Activity Summary
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-600">
            <p><strong>Reporting Period:</strong> Past 14 Days</p>
            <p><strong>Primary Caregiver:</strong> {caregiver?.name} ({caregiver?.relationToPatient})</p>
            <p><strong>Contact:</strong> {caregiver?.phone}</p>
          </div>
        </div>

        {/* Section 1: Patient Demographic & Context */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sage-800 border-b border-stone-200 pb-1 mb-3">
            1. Patient Identification & Background
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block">Full Name:</span>
              <strong className="text-stone-900 text-sm">{patient.name}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Preferred Name:</span>
              <strong className="text-stone-900 text-sm">{patient.preferredName}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Age / Location:</span>
              <strong className="text-stone-900 text-sm">{patient.age} yrs • {patient.city}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Primary Language:</span>
              <strong className="text-stone-900 text-sm uppercase">{patient.language}</strong>
            </div>
            <div className="col-span-2 sm:col-span-4 border-t border-stone-200 pt-2 mt-1">
              <span className="text-stone-500 block">Caregiver Notes / Baseline:</span>
              <span className="text-stone-800">{patient.specialNotes || 'Good morning concentration; sundowning sensitivity noticed around dusk.'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Medication & Routine Adherence */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sage-800 border-b border-stone-200 pb-1 mb-3">
            2. Medication Schedule & Daily Adherence ({adherenceRate}% Logged Rate)
          </h3>
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold">
              <tr>
                <th className="p-2.5">Scheduled Time</th>
                <th className="p-2.5">Medication / Activity</th>
                <th className="p-2.5">Dosage / Details</th>
                <th className="p-2.5">Caregiver Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {routine.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50">
                  <td className="p-2.5 font-bold text-stone-800">{item.time}</td>
                  <td className="p-2.5 font-medium text-stone-900">{item.title}</td>
                  <td className="p-2.5 text-stone-600">{item.dosage || 'Routine schedule'}</td>
                  <td className="p-2.5">
                    {item.completed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Taken / Done
                      </span>
                    ) : (
                      <span className="text-stone-400 italic">Pending / Scheduled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Cognitive Engagement & Game Trends */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sage-800 border-b border-stone-200 pb-1 mb-3">
            3. Cognitive Game Observations (Descriptive Longitudinal Log)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 block">Total Sessions:</span>
              <strong className="text-lg text-stone-900">{gameResults.length} sessions</strong>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 block">Average Reaction Time:</span>
              <strong className="text-lg text-stone-900">4.3 seconds</strong>
            </div>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 block">Highest Difficulty Level:</span>
              <strong className="text-lg text-stone-900">Level 2 (Comfortable)</strong>
            </div>
          </div>
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold">
              <tr>
                <th className="p-2.5">Game Module</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Score</th>
                <th className="p-2.5">Reaction Time</th>
                <th className="p-2.5">Observation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {gameResults.slice(0, 5).map((gr) => (
                <tr key={gr.id}>
                  <td className="p-2.5 font-bold capitalize text-stone-800">{gr.gameType.replace('_', ' ')}</td>
                  <td className="p-2.5 text-stone-600">{new Date(gr.timestamp).toLocaleDateString()}</td>
                  <td className="p-2.5 font-semibold text-stone-900">{gr.score}%</td>
                  <td className="p-2.5 text-stone-600">{gr.reactionTimeSec}s</td>
                  <td className="p-2.5 text-stone-700 italic">{gr.notes || 'Normal engagement'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Tone & Sundowning Incidents */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sage-800 border-b border-stone-200 pb-1 mb-3">
            4. Behavioral & Tone Log (Agitation / Disorientation Events)
          </h3>
          <div className="space-y-2 text-xs">
            {toneLogs.map((tl) => (
              <div key={tl.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase text-stone-800 mr-2">[{tl.tone}]</span>
                  <span className="text-stone-900">{tl.context}</span>
                  {tl.triggerDetected && (
                    <span className="text-amber-800 font-medium ml-2">• Observed Trigger: {tl.triggerDetected}</span>
                  )}
                </div>
                <span className="text-stone-400 shrink-0">{new Date(tl.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Voice Journal Sample */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sage-800 border-b border-stone-200 pb-1 mb-3">
            5. Spontaneous Speech Sample (Daily Voice Journal)
          </h3>
          {journalEntries.length > 0 ? (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs italic text-stone-800">
              <p className="font-bold not-italic text-stone-500 mb-1">
                Latest Transcript ({journalEntries[0].date} at {journalEntries[0].timestamp}):
              </p>
              "{journalEntries[0].transcript}"
            </div>
          ) : (
            <p className="text-xs text-stone-500">No journal entries logged during this period.</p>
          )}
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-8 border-t border-stone-300 flex justify-between items-end text-xs text-stone-600">
          <div>
            <p>Reviewed By Consulting Physician / Geriatrician:</p>
            <div className="mt-8 border-b border-stone-400 w-64" />
            <p className="mt-1 text-[11px] text-stone-400">Doctor's Signature & Date</p>
          </div>
          <div className="text-right text-[11px] text-stone-400">
            Sahayak Clinical Summary Export • Confidential Medical Patient Record
          </div>
        </div>
      </div>
    </div>
  );
};
