import React, { useState } from 'react';
import type { MemberProfile as MemberProfileType } from '../../services/memberPortalService';

interface MemberProfileProps {
  profile: MemberProfileType;
  onSaveProfile: (profile: MemberProfileType) => Promise<void> | void;
  onChangePassword: (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void> | void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ profile, onSaveProfile, onChangePassword }) => {
  const [form, setForm] = useState<MemberProfileType>(profile);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Profile</h1>
        <p className="text-zinc-500 mt-2 font-medium">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-6">Personal Information</h3>
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setMessage(null);
              setError(null);
              try {
                await onSaveProfile(form);
                setMessage('Profile updated successfully.');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to update profile.');
              }
            }}
          >
            <input
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Full name"
              required
            />
            <input
              value={form.email}
              disabled
              className="w-full px-5 py-4 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500"
              placeholder="Email"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Phone number"
            />
            <input
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Address"
            />
            <input
              value={form.emergencyContact}
              onChange={(event) => setForm((prev) => ({ ...prev, emergencyContact: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Emergency contact"
            />

            {message && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
                {error}
              </div>
            )}

            <button className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-95 transition-all">
              Save Profile
            </button>
          </form>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-6">Change Password</h3>
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              if (passwordForm.newPassword.length < 8) {
                setPasswordMessage('New password must be at least 8 characters.');
                return;
              }
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordMessage('Password confirmation does not match.');
                return;
              }
              try {
                await onChangePassword(passwordForm);
                setPasswordMessage('Password updated successfully.');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              } catch (err) {
                setPasswordMessage(err instanceof Error ? err.message : 'Unable to update password.');
              }
            }}
          >
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Current password"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="New password"
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Confirm new password"
              required
            />

            {passwordMessage && (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 font-semibold">
                {passwordMessage}
              </div>
            )}

            <button className="px-6 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
