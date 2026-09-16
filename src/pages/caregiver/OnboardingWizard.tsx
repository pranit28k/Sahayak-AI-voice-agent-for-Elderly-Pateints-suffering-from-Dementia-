import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Users,
  Clock,
  Home,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';
import { SupportedLanguage } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const {
    patient,
    updatePatientProfile,
    familyMembers,
    addFamilyMember,
    deleteFamilyMember,
    routine,
    addRoutineItem,
    triggers,
    rooms,
    consent,
    setConsent,
  } = useAppStore();

  const [step, setStep] = useState(1);

  // Form State initialized from store
  const [patientData, setPatientData] = useState({
    name: patient.name,
    preferredName: patient.preferredName,
    age: patient.age,
    city: patient.city,
    language: patient.language,
    wakeTime: patient.wakeTime,
    sleepTime: patient.sleepTime,
    pastOccupation: patient.pastOccupation || '',
    hobbiesStr: patient.hobbies.join(', '),
  });

  // New family member draft
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    greetingText: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  });

  // New routine item draft
  const [newRoutine, setNewRoutine] = useState({
    time: '09:00 AM',
    title: '',
    category: 'medicine' as const,
    dosage: '',
  });

  // Consent form state
  const [consentChecked, setConsentChecked] = useState(consent?.consentGiven ?? true);
  const [signerName, setSignerName] = useState(consent?.consentedBy || 'Priya Sharma');

  const handlePatientSave = () => {
    updatePatientProfile({
      name: patientData.name,
      preferredName: patientData.preferredName,
      age: Number(patientData.age),
      city: patientData.city,
      language: patientData.language as SupportedLanguage,
      wakeTime: patientData.wakeTime,
      sleepTime: patientData.sleepTime,
      pastOccupation: patientData.pastOccupation,
      hobbies: patientData.hobbiesStr.split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.relation) return;
    addFamilyMember({
      name: newMember.name,
      relation: newMember.relation,
      greetingText: newMember.greetingText || `Hello Dadaji, it is ${newMember.name}. Have a peaceful day!`,
      photoUrl: newMember.photoUrl,
    });
    setNewMember({
      name: '',
      relation: '',
      greetingText: '',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    });
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutine.title) return;
    addRoutineItem({
      time: newRoutine.time,
      title: newRoutine.title,
      category: newRoutine.category,
      dosage: newRoutine.dosage,
      completed: false,
    });
    setNewRoutine({
      time: '09:00 AM',
      title: '',
      category: 'medicine',
      dosage: '',
    });
  };

  const handleFinishWizard = () => {
    handlePatientSave();
    setConsent({
      consentGiven: consentChecked,
      consentDate: new Date().toISOString(),
      consentedBy: signerName,
    });
    navigate('/caregiver/dashboard');
  };

  const testTTSGreeting = (text: string) => {
    voiceEngine.speak(text, patientData.language);
  };

  const stepsHeader = [
    { num: 1, title: 'Patient Basics', icon: User },
    { num: 2, title: 'Family Members', icon: Users },
    { num: 3, title: 'Routine & Care', icon: Clock },
    { num: 4, title: 'Home Layout', icon: Home },
    { num: 5, title: 'Review & Consent', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepsHeader.map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  handlePatientSave();
                  setStep(s.num);
                }}
                className={`flex-1 flex flex-col items-center group cursor-pointer ${
                  isCurrent ? 'text-sage-700' : isDone ? 'text-stone-700' : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all mb-1 ${
                    isCurrent
                      ? 'bg-sage-600 text-white ring-4 ring-sage-200'
                      : isDone
                      ? 'bg-sage-100 text-sage-800 border border-sage-300'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
        
        {/* STEP 1: Patient Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Step 1: Patient Profile & Care Context</h2>
              <p className="text-sm text-stone-600 mt-1">
                Enter core details about your loved one to tailor Sahayak's speech and pace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Preferred Call Name (e.g. Dadu, Baba, Ramesh ji)
                </label>
                <input
                  type="text"
                  value={patientData.preferredName}
                  onChange={(e) => setPatientData({ ...patientData, preferredName: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Age</label>
                <input
                  type="number"
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: Number(e.target.value) })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">City / Region</label>
                <input
                  type="text"
                  value={patientData.city}
                  onChange={(e) => setPatientData({ ...patientData, city: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Primary Voice Language</label>
                <select
                  value={patientData.language}
                  onChange={(e) => setPatientData({ ...patientData, language: e.target.value as SupportedLanguage })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white"
                >
                  <option value="en">English (Indian Accent)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="as">Assamese (অসমীয়া)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Wake Time</label>
                <input
                  type="text"
                  value={patientData.wakeTime}
                  onChange={(e) => setPatientData({ ...patientData, wakeTime: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Past Occupation & Hobbies</label>
                <input
                  type="text"
                  value={patientData.pastOccupation}
                  onChange={(e) => setPatientData({ ...patientData, pastOccupation: e.target.value })}
                  placeholder="e.g. Chief Railway Engineer, loves Rabindra Sangeet, tea garden strolls"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
                <p className="text-xs text-stone-500 mt-1">
                  Used by Sahayak as gentle conversational anchors, never shown as test items.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Family Members */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Step 2: Family Members & Greeting Phrases</h2>
              <p className="text-sm text-stone-600 mt-1">
                Upload photos and write personalized greetings. Sahayak speaks these greetings aloud when your loved one touches a family portrait.
              </p>
            </div>

            {/* List of existing members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-sm truncate">{member.name}</h4>
                      <button
                        onClick={() => deleteFamilyMember(member.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-sage-700 mb-1">{member.relation}</p>
                    <p className="text-xs text-stone-600 italic line-clamp-2">"{member.greetingText}"</p>
                    <button
                      onClick={() => testTTSGreeting(member.greetingText)}
                      className="mt-2 flex items-center gap-1 text-xs text-indigoSoft-600 hover:text-indigoSoft-800 font-semibold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Test Speech</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add member form */}
            <div className="p-4 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/60">
              <h3 className="font-bold text-sm text-stone-800 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sage-600" />
                <span>Add Another Family Member</span>
              </h3>
              <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Name (e.g. Aarav Sharma)"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Grandson)"
                    value={newMember.relation}
                    onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    placeholder="Greeting phrase read aloud to patient (e.g. Hello Dadaji, it's Aarav! I hope you are having a nice day.)"
                    value={newMember.greetingText}
                    onChange={(e) => setNewMember({ ...newMember, greetingText: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Add Family Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 3: Daily Routine & Medicine */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Step 3: Daily Routine, Medicines & Agitation Triggers</h2>
              <p className="text-sm text-stone-600 mt-1">
                Feeds the patient reminder view and clinician report. Note: Caregiver triggers are soft context, never automated medical diagnoses.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wider">Scheduled Daily Items</h3>
              <div className="space-y-2">
                {routine.map((item) => (
                  <div key={item.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-md mr-2">
                        {item.time}
                      </span>
                      <strong className="text-sm text-stone-900">{item.title}</strong>
                      {item.dosage && (
                        <span className="text-xs text-stone-500 ml-2">({item.dosage})</span>
                      )}
                    </div>
                    <span className="text-xs capitalize px-2 py-1 bg-stone-200 text-stone-700 rounded-md">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Routine Item Form */}
              <form onSubmit={handleAddRoutine} className="p-4 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50/60 mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Time (e.g. 03:00 PM)"
                  value={newRoutine.time}
                  onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
                  className="p-2 border border-stone-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Title (e.g. Afternoon Tea)"
                  value={newRoutine.title}
                  onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                  className="p-2 border border-stone-300 rounded-lg text-xs sm:col-span-2"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Add Item
                </button>
              </form>
            </div>

            {/* Agitation Triggers List */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <h3 className="font-bold text-sm text-stone-800 uppercase tracking-wider">Known Agitation Triggers & Sahayak Soft Guidance</h3>
              <div className="space-y-2">
                {triggers.map((tr) => (
                  <div key={tr.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                    <p className="font-bold text-amber-950">Trigger: {tr.trigger}</p>
                    <p className="text-amber-800 mt-0.5">Gentle Sahayak Strategy: {tr.guidanceForSahayak}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Home Layout */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Step 4: Home Rooms & Orientation Guide</h2>
              <p className="text-sm text-stone-600 mt-1">
                These 4 key rooms seed the Patient House Map stub. When your loved one asks "Where is the kitchen?", Sahayak speaks the warm directional text.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50">
                  <img src={room.photoUrl} alt={room.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h4 className="font-bold text-stone-900 text-base">{room.name}</h4>
                    <p className="text-xs text-stone-500 font-medium mb-2">{room.direction}</p>
                    <p className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 italic">
                      "{room.guidanceVoiceText}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Review & Consent */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Step 5: Review & Explicit Caregiver Consent</h2>
              <p className="text-sm text-stone-600 mt-1">
                Please confirm privacy and consent terms before completing setup.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-sm text-stone-700 leading-relaxed">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <span>Notice on Clinical Non-Diagnosis & Privacy</span>
              </div>
              <p>
                1. <strong>Non-Clinical Tool:</strong> Sahayak is an assistive cognitive gaming and memory companion. It does <em>not</em> provide medical diagnosis, clinical staging, or pharmaceutical prescriptions.
              </p>
              <p>
                2. <strong>Data Privacy:</strong> All family photos, spoken transcripts, and daily mood entries remain saved locally in your browser storage for this demonstration. Audio recordings are not broadcast to third parties.
              </p>
              <p>
                3. <strong>Emergency Protocol:</strong> If patient distress or panic keywords are detected, Sahayak immediately prompts the user with an offer to call the primary caregiver ({signerName}).
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="w-5 h-5 rounded text-sage-600 focus:ring-sage-500 mt-0.5"
                />
                <span className="text-sm font-semibold text-stone-800">
                  I explicitly consent to storing family photos, routine schedules, and patient voice interaction logs for the purpose of personalized dementia memory assistance.
                </span>
              </label>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Primary Caregiver Signature / Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full max-w-sm p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => {
              handlePatientSave();
              setStep((s) => s - 1);
            }}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              step === 1
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : 'text-stone-700 hover:bg-stone-100 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                handlePatientSave();
                setStep((s) => s + 1);
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!consentChecked}
              onClick={handleFinishWizard}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer ${
                consentChecked
                  ? 'bg-sage-600 hover:bg-sage-700 text-white'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Onboarding & Go to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
