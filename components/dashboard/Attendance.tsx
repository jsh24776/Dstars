import React, { useEffect, useMemo, useState } from 'react';
import type { AttendanceRecord, AttendanceSummary } from '../../types';
import {
  checkInMemberAttendance,
  checkOutMemberAttendance,
  deleteAttendanceRecord,
  fetchAdminAttendance,
  fetchAdminAttendanceSummary,
  fetchMemberAttendanceHistory,
  markMemberAbsent,
  updateAttendanceRecord,
} from '../../services/attendanceService';

type AttendanceFilter = 'all' | 'present' | 'late' | 'absent' | 'cancelled';
type ViewMode = 'live' | 'calendar';

interface DayData {
  date: string;
  records: AttendanceRecord[];
  present: number;
  late: number;
  absent: number;
  cancelled: number;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_SUMMARY: AttendanceSummary = {
  range: { from_date: '', to_date: '' },
  total_check_ins_today: 0,
  total_absences_today: 0,
  monthly_attendance_count: 0,
  most_active_members: [],
  attendance_trends: [],
  peak_attendance_times: [],
};

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (v: string | null) => (v ? new Date(v).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--');
const hourLabel = (h: number) => {
  const s = new Date(); s.setHours(h, 0, 0, 0);
  const e = new Date(); e.setHours((h + 1) % 24, 0, 0, 0);
  return `${s.toLocaleTimeString([], { hour: 'numeric' })} - ${e.toLocaleTimeString([], { hour: 'numeric' })}`;
};
const monthBounds = (d: Date) => {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end, from: iso(start), to: iso(end) };
};

const Attendance: React.FC = () => {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<AttendanceFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null);
  const [memberHistory, setMemberHistory] = useState<AttendanceRecord[]>([]);

  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarRecords, setCalendarRecords] = useState<AttendanceRecord[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(iso(new Date()));

  const loadLive = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([
        fetchAdminAttendanceSummary(),
        fetchAdminAttendance({ per_page: 25, ...(statusFilter !== 'all' ? { status: statusFilter } : {}) }),
      ]);
      setSummary(s);
      setRecords(p.data);
    } catch (e) {
      setSummary(DEFAULT_SUMMARY);
      setRecords([]);
      setError(e instanceof Error ? e.message : 'Unable to load attendance records.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendar = async () => {
    const b = monthBounds(calendarMonth);
    setCalendarLoading(true);
    setError(null);
    try {
      let page = 1;
      let last = 1;
      const all: AttendanceRecord[] = [];
      while (page <= last) {
        const p = await fetchAdminAttendance({ date_from: b.from, date_to: b.to, per_page: 100, page });
        all.push(...p.data);
        last = p.meta.last_page;
        page += 1;
      }
      setCalendarRecords(all);
      const today = iso(new Date());
      if (selectedDate < b.from || selectedDate > b.to) {
        setSelectedDate(today >= b.from && today <= b.to ? today : b.from);
      }
    } catch (e) {
      setCalendarRecords([]);
      setError(e instanceof Error ? e.message : 'Unable to load calendar attendance.');
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => { loadLive(); /* eslint-disable-next-line */ }, [statusFilter]);
  useEffect(() => { if (viewMode === 'calendar') loadCalendar(); /* eslint-disable-next-line */ }, [viewMode, calendarMonth]);

  const weeklyGrid = useMemo(() => {
    const map = new Map(summary.attendance_trends.map((t) => [t.date, t.total_check_ins]));
    const points = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { d, count: Number(map.get(iso(d)) ?? 0) };
    });
    const max = Math.max(...points.map((x) => x.count), 0);
    return points.map((x) => ({
      day: x.d.toLocaleDateString([], { weekday: 'short' }),
      date: x.d.toLocaleDateString([], { day: '2-digit' }),
      status: max <= 0 ? 'Low' : x.count / max >= 0.75 ? 'High' : x.count / max >= 0.4 ? 'Medium' : 'Low',
      count: x.count,
    }));
  }, [summary.attendance_trends]);

  const logRows = useMemo(() => records.slice(0, 12).map((r) => ({
    record: r,
    name: r.member?.full_name ?? `Member #${r.member_id}`,
    time: fmtTime(r.check_out_time ?? r.check_in_time),
    source: r.source?.replaceAll('_', ' ') ?? 'Admin',
    status: r.status === 'absent' ? 'No Show' : r.check_out_time ? 'Checked Out' : r.status === 'cancelled' ? 'Cancelled' : 'Checked In',
  })), [records]);

  const dayMap = useMemo(() => {
    const map = new Map<string, DayData>();
    calendarRecords.forEach((r) => {
      const d = map.get(r.attendance_date) ?? { date: r.attendance_date, records: [], present: 0, late: 0, absent: 0, cancelled: 0 };
      d.records.push(r);
      if (r.status === 'present') d.present += 1;
      else if (r.status === 'late') d.late += 1;
      else if (r.status === 'absent') d.absent += 1;
      else if (r.status === 'cancelled') d.cancelled += 1;
      map.set(r.attendance_date, d);
    });
    return map;
  }, [calendarRecords]);

  const calendarCells = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const days = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7;
    const out: Array<{ empty: true } | { empty: false; day: number; date: string; data?: DayData }> = [];
    for (let i = 0; i < lead; i++) out.push({ empty: true });
    for (let day = 1; day <= days; day++) {
      const date = iso(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
      out.push({ empty: false, day, date, data: dayMap.get(date) });
    }
    while (out.length % 7 !== 0) out.push({ empty: true });
    return out;
  }, [calendarMonth, dayMap]);

  const selectedDay = useMemo(() => dayMap.get(selectedDate), [dayMap, selectedDate]);
  const selectedRows = useMemo(
    () => (selectedDay?.records ?? []).slice().sort((a, b) => (new Date(b.check_in_time ?? b.created_at ?? 0).getTime() - new Date(a.check_in_time ?? a.created_at ?? 0).getTime())),
    [selectedDay]
  );

  const avgDaily = Math.round(summary.monthly_attendance_count / Math.max(new Date().getDate(), 1));
  const peakWindow = summary.peak_attendance_times[0] ? hourLabel(summary.peak_attendance_times[0].hour) : '--';
  const base = summary.total_check_ins_today + summary.total_absences_today;
  const noShowRate = base > 0 ? `${((summary.total_absences_today / base) * 100).toFixed(1)}%` : '0%';

  const cycleStatus = () => setStatusFilter((s) => (s === 'all' ? 'present' : s === 'present' ? 'late' : s === 'late' ? 'absent' : s === 'absent' ? 'cancelled' : 'all'));
  const loadHistory = async (memberId: number) => { try { const p = await fetchMemberAttendanceHistory(memberId, { per_page: 5 }); setMemberHistory(p.data); } catch { setMemberHistory([]); } };
  const openDetails = async (r: AttendanceRecord) => { setActiveRecord(r); setShowDetails(true); await loadHistory(r.member_id); };

  const quickCheckIn = async (date?: string) => {
    const raw = window.prompt('Enter member ID for check-in:'); if (!raw) return;
    const memberId = Number(raw); if (!Number.isInteger(memberId) || memberId <= 0) { setError('A valid numeric member ID is required.'); return; }
    const sraw = window.prompt('Status for check-in? (present/late)', 'present'); if (sraw === null) return;
    const status = sraw.trim().toLowerCase() === 'late' ? 'late' : 'present';
    const notes = window.prompt('Optional notes for this check-in:', '') ?? '';
    setIsSubmitting(true); setError(null);
    try {
      await checkInMemberAttendance({ member_id: memberId, attendance_date: date, status, source: 'admin_manual', notes: notes.trim() || undefined });
      await loadLive(); if (viewMode === 'calendar') await loadCalendar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to check in member.'); } finally { setIsSubmitting(false); }
  };

  const markAbsentForSelectedDate = async () => {
    const raw = window.prompt(`Enter member ID to mark absent on ${selectedDate}:`); if (!raw) return;
    const memberId = Number(raw); if (!Number.isInteger(memberId) || memberId <= 0) { setError('A valid numeric member ID is required.'); return; }
    const notes = window.prompt('Optional absence note:', '') ?? '';
    setIsSubmitting(true); setError(null);
    try {
      await markMemberAbsent({ member_id: memberId, attendance_date: selectedDate, source: 'admin_manual', notes: notes.trim() || undefined, allow_override: false });
      await loadLive(); await loadCalendar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to mark absence.'); } finally { setIsSubmitting(false); }
  };

  const checkOut = async () => {
    if (!activeRecord) return;
    setIsSubmitting(true); setError(null);
    try {
      const updated = await checkOutMemberAttendance({ member_id: activeRecord.member_id, attendance_date: activeRecord.attendance_date });
      setActiveRecord(updated); await loadLive(); if (viewMode === 'calendar') await loadCalendar(); await loadHistory(activeRecord.member_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to check out member.'); } finally { setIsSubmitting(false); }
  };

  const markAbsent = async () => {
    if (!activeRecord || !window.confirm('Mark this attendance as absent?')) return;
    setIsSubmitting(true); setError(null);
    try {
      const updated = await markMemberAbsent({
        member_id: activeRecord.member_id,
        attendance_date: activeRecord.attendance_date,
        source: 'admin_manual',
        notes: activeRecord.notes ?? undefined,
        allow_override: true,
      });
      setActiveRecord(updated); await loadLive(); if (viewMode === 'calendar') await loadCalendar(); await loadHistory(activeRecord.member_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to mark absence.'); } finally { setIsSubmitting(false); }
  };

  const editRecord = async () => {
    if (!activeRecord) return;
    const statusRaw = window.prompt('Set status (present/late/absent/cancelled):', `${activeRecord.status ?? 'present'}`); if (!statusRaw) return;
    const status = statusRaw.trim().toLowerCase();
    if (!['present', 'late', 'absent', 'cancelled'].includes(status)) { setError('Status must be present, late, absent, or cancelled.'); return; }
    const cin = window.prompt('Check-in time (HH:mm:ss) or empty to clear:', activeRecord.check_in_time ? new Date(activeRecord.check_in_time).toTimeString().slice(0, 8) : ''); if (cin === null) return;
    const cout = window.prompt('Check-out time (HH:mm:ss) or empty to clear:', activeRecord.check_out_time ? new Date(activeRecord.check_out_time).toTimeString().slice(0, 8) : ''); if (cout === null) return;
    const notes = window.prompt('Notes:', activeRecord.notes ?? ''); if (notes === null) return;
    setIsSubmitting(true); setError(null);
    try {
      const updated = await updateAttendanceRecord(activeRecord.id, { status: status as any, check_in_time: cin.trim() || null, check_out_time: cout.trim() || null, notes: notes.trim() || null });
      setActiveRecord(updated); await loadLive(); if (viewMode === 'calendar') await loadCalendar(); await loadHistory(activeRecord.member_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update attendance record.'); } finally { setIsSubmitting(false); }
  };

  const removeRecord = async () => {
    if (!activeRecord || !window.confirm('Delete this attendance record?')) return;
    setIsSubmitting(true); setError(null);
    try {
      await deleteAttendanceRecord(activeRecord.id);
      setShowDetails(false); setActiveRecord(null); await loadLive(); if (viewMode === 'calendar') await loadCalendar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete attendance record.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Attendance</h1>
          <p className="text-zinc-500 mt-1">Operational visibility into daily check-ins and presence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setViewMode((v) => (v === 'live' ? 'calendar' : 'live'))} className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-600 hover:bg-zinc-50 transition-all uppercase tracking-widest">{viewMode === 'live' ? 'Calendar View' : 'Live View'}</button>
          <button onClick={() => quickCheckIn(viewMode === 'calendar' ? selectedDate : undefined)} disabled={isSubmitting} className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-xl shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest disabled:opacity-50">Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-2xl font-black text-zinc-900">Weekly Activity</h2><p className="text-sm text-zinc-400">Check-in density by day.</p></div>
            <div className="flex bg-zinc-50 border border-zinc-100 rounded-2xl p-1"><button className="px-4 py-2 bg-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">This Week</button><button className="px-4 py-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Last Week</button></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {weeklyGrid.map((item) => (
              <div key={`${item.day}-${item.date}`} className="rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{item.day}</div>
                <div className="text-lg font-black text-zinc-900 mt-2">{item.date}</div>
                <div className={`mt-4 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest border ${item.status === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : item.status === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>{item.status}</div>
                <div className="text-xs text-zinc-400 font-medium mt-3">{item.count} check-ins</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10"><h3 className="text-2xl font-black mb-2">Attendance Summary</h3><p className="text-zinc-500 text-sm">Operational performance snapshot.</p></div>
          <div className="mt-10 space-y-6 relative z-10">
            {[{ label: 'Avg. Daily Check-ins', value: String(avgDaily) }, { label: 'Peak Window', value: peakWindow }, { label: 'No Show Rate', value: noShowRate }, { label: 'Today Check-ins', value: String(summary.total_check_ins_today) }].map((item) => (<div key={item.label} className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span><span className="text-sm font-black text-white">{item.value}</span></div>))}
          </div>
          <button className="relative z-10 mt-10 w-full py-4 bg-white/5 hover:bg-white hover:text-black transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">Open Heatmap</button>
        </div>
      </div>

      {viewMode === 'live' ? (
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-zinc-900">Live Check-In Log</h2>
              <p className="text-sm text-zinc-400">Real-time activity from the last hour.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={loadLive} className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">Location: All</button>
              <button onClick={cycleStatus} className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">Status: {statusFilter === 'all' ? 'All' : statusFilter}</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/30 border-b border-zinc-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Time</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {logRows.length > 0 ? logRows.map((entry) => (
                  <tr key={entry.record.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-zinc-900">{entry.name}</td>
                    <td className="px-8 py-6 text-sm text-zinc-500">{entry.time}</td>
                    <td className="px-8 py-6 text-sm text-zinc-500">{entry.source}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${entry.status === 'Checked In' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : entry.status === 'Checked Out' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{entry.status}</span>
                    </td>
                    <td className="px-8 py-6">
                      <button onClick={() => openDetails(entry.record)} className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100">Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-sm font-medium text-zinc-400">{isLoading ? 'Loading attendance...' : 'No attendance records found.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900">Attendance Calendar</h2>
                <p className="text-sm text-zinc-400">Monthly check-in and absence map.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCalendarMonth((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))} className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">Prev</button>
                <div className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-white min-w-[150px] text-center">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                <button onClick={() => setCalendarMonth((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))} className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">Next</button>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {WEEKDAYS.map((d) => <div key={d} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, idx) => {
                  if (cell.empty) return <div key={`empty-${idx}`} className="h-28 rounded-2xl border border-transparent"></div>;
                  const total = (cell.data?.present ?? 0) + (cell.data?.late ?? 0) + (cell.data?.absent ?? 0) + (cell.data?.cancelled ?? 0);
                  const selected = selectedDate === cell.date;
                  const today = cell.date === iso(new Date());
                  return (
                    <button key={cell.date} onClick={() => setSelectedDate(cell.date)} className={`h-28 rounded-2xl border p-3 text-left transition-all ${selected ? 'border-primary bg-primary/5' : 'border-zinc-100 bg-zinc-50/40 hover:bg-zinc-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${today ? 'text-primary' : 'text-zinc-900'}`}>{cell.day}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{total} total</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="text-[10px] font-bold text-emerald-600">P: {cell.data?.present ?? 0}</div>
                        <div className="text-[10px] font-bold text-amber-600">L: {cell.data?.late ?? 0}</div>
                        <div className="text-[10px] font-bold text-red-600">A: {cell.data?.absent ?? 0}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-zinc-900">Day Details</h3>
                <p className="text-xs text-zinc-400">{fmtDate(selectedDate)}</p>
              </div>
              <button onClick={() => quickCheckIn(selectedDate)} disabled={isSubmitting} className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all disabled:opacity-50">Check In</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-center"><div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Present</div><div className="text-lg font-black text-emerald-700">{selectedDay?.present ?? 0}</div></div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-center"><div className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Late</div><div className="text-lg font-black text-amber-700">{selectedDay?.late ?? 0}</div></div>
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center"><div className="text-[10px] font-bold uppercase tracking-widest text-red-500">Absent</div><div className="text-lg font-black text-red-700">{selectedDay?.absent ?? 0}</div></div>
            </div>
            <div className="mb-4"><button onClick={markAbsentForSelectedDate} disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all disabled:opacity-50">Mark Absence</button></div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {calendarLoading ? (
                <div className="text-xs text-zinc-400">Loading day attendance...</div>
              ) : selectedRows.length > 0 ? selectedRows.map((r) => (
                <div key={r.id} className="rounded-xl border border-zinc-100 bg-zinc-50/40 px-3 py-2">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-zinc-900">{r.member?.full_name ?? `Member #${r.member_id}`}</span><span className="text-[10px] font-bold uppercase text-zinc-500">{r.status}</span></div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400"><span>{fmtTime(r.check_in_time)}</span><button onClick={() => openDetails(r)} className="px-2 py-1 rounded-lg border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all">Details</button></div>
                </div>
              )) : (
                <div className="text-xs text-zinc-400">No attendance records for this day.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600">{error}</div>}

      {showDetails && activeRecord && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Attendance Details</h3>
                <p className="text-sm text-zinc-400">Review and correct this attendance record.</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900">X</button>
            </div>
            <div className="space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between"><span>Member</span><span className="font-semibold text-zinc-900">{activeRecord.member?.full_name ?? `Member #${activeRecord.member_id}`}</span></div>
              <div className="flex items-center justify-between"><span>Date</span><span>{fmtDate(activeRecord.attendance_date)}</span></div>
              <div className="flex items-center justify-between"><span>Status</span><span className="font-semibold text-zinc-900 uppercase">{activeRecord.status}</span></div>
              <div className="flex items-center justify-between"><span>Check-in</span><span>{fmtTime(activeRecord.check_in_time)}</span></div>
              <div className="flex items-center justify-between"><span>Check-out</span><span>{fmtTime(activeRecord.check_out_time)}</span></div>
              <div className="flex items-center justify-between"><span>Notes</span><span className="max-w-[60%] truncate">{activeRecord.notes || '--'}</span></div>
            </div>
            <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Recent Member History</div>
              <div className="space-y-2">
                {memberHistory.length > 0 ? memberHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs text-zinc-500"><span>{fmtDate(h.attendance_date)}</span><span className="font-semibold uppercase">{h.status}</span><span>{fmtTime(h.check_in_time)}</span></div>
                )) : <div className="text-xs text-zinc-400">No recent attendance history found.</div>}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button onClick={checkOut} disabled={isSubmitting} className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 disabled:opacity-40">Check Out</button>
              <button onClick={markAbsent} disabled={isSubmitting} className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 disabled:opacity-40">Mark Absent</button>
              <button onClick={editRecord} disabled={isSubmitting} className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 disabled:opacity-40">Edit Record</button>
              <button onClick={removeRecord} disabled={isSubmitting} className="px-5 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-40">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
