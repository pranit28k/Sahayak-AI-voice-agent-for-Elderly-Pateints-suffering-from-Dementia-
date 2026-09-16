import React, { useState } from 'react';
import { Users, Plus, Volume2, Trash2, Edit3, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { voiceEngine } from '../../services/voiceEngine';
import { FamilyMember } from '../../types';

export const FamilyTreeBuilder: React.FC = () => {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember, currentLanguage } =
    useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    greetingText: '',
    phone: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  });

  const presetAvatars = [
    { label: 'Daughter / Adult Woman', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { label: 'Grandson / Young Boy', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
    { label: 'Doctor / Professional Woman', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
    { label: 'Son / Adult Man', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { label: 'Granddaughter / Girl', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { label: 'Spouse / Elderly Companion', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relation) return;
    addFamilyMember({
      name: formData.name,
      relation: formData.relation,
      greetingText: formData.greetingText || `Namaste Dadaji, it is ${formData.name}. Have a peaceful day!`,
      photoUrl: formData.photoUrl,
      phone: formData.phone || undefined,
    });
    setFormData({
      name: '',
      relation: '',
      greetingText: '',
      phone: '',
      photoUrl: presetAvatars[0].url,
    });
    setIsAdding(false);
  };

  const handleStartEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      relation: member.relation,
      greetingText: member.greetingText,
      phone: member.phone || '',
      photoUrl: member.photoUrl,
    });
  };

  const handleSaveEdit = (id: string) => {
    updateFamilyMember(id, {
      name: formData.name,
      relation: formData.relation,
      greetingText: formData.greetingText,
      phone: formData.phone || undefined,
      photoUrl: formData.photoUrl,
    });
    setEditingId(null);
  };

  const playTTS = (text: string) => {
    voiceEngine.speak(text, currentLanguage);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-sage-600" />
            <span>Family Tree & Memory Portraits</span>
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Configure photos and personalized greetings for your loved one. These portraits populate the patient's Family Tree screen and Family Face Recognition game.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sage-600 hover:bg-sage-700 active:scale-98 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Add New Member Drawer/Card */}
      {isAdding && (
        <div className="bg-white rounded-2xl p-6 border-2 border-sage-300 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sage-600" />
            <span>New Family Member Profile</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandson (Age 14)"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Spoken Greeting Phrase (TTS Read Aloud)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hello Dadaji, it is Aarav! I hope you are having a peaceful day. I love you!"
                  value={formData.greetingText}
                  onChange={(e) => setFormData({ ...formData, greetingText: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Choose Photo Avatar</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {presetAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av.url}
                      alt={av.label}
                      onClick={() => setFormData({ ...formData, photoUrl: av.url })}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        formData.photoUrl === av.url ? 'border-sage-600 scale-105 shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                      title={av.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyMembers.map((member) => {
          const isEditing = editingId === member.id;

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-48 bg-stone-100">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-stone-800 shadow-xs">
                  {member.relation}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {isEditing ? (
                    <div className="space-y-2 mb-3">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg text-sm font-bold"
                      />
                      <input
                        type="text"
                        value={formData.relation}
                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                      />
                      <textarea
                        rows={2}
                        value={formData.greetingText}
                        onChange={(e) => setFormData({ ...formData, greetingText: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-stone-900">{member.name}</h3>
                      <div className="mt-3 p-3 bg-sage-50/70 border border-sage-200/60 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-sage-700 tracking-wider block mb-1">
                          Voice Greeting Played on Tap:
                        </span>
                        <p className="text-xs text-stone-700 italic">
                          "{member.greetingText}"
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => playTTS(isEditing ? formData.greetingText : member.greetingText)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigoSoft-50 hover:bg-indigoSoft-100 text-indigoSoft-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Test TTS Voice</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(member.id)}
                        className="p-2 text-sage-600 hover:bg-sage-50 rounded-lg"
                        title="Save Changes"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(member)}
                        className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg"
                        title="Edit Member"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteFamilyMember(member.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
