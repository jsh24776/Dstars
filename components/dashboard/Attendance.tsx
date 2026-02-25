import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AttendanceRecord, AttendanceSummary } from '../../types';
import {
  checkInMemberAttendance,
  fetchAdminAttendance,
  fetchAdminAttendanceSummary,
  fetchMemberAttendanceHistory,
} from '../../services/attendanceService';

const DEFAULT_SUMMARY: AttendanceSummary = {
  range: { from_date: '', to_date: '' },
  today_total_check_ins: 0,
  total_active_members: 0,
  total_expired_members: 0,
  members_expiring_in_3_days: 0,
  today_check_ins: [],
  most_active_members: [],
  attendance_trends: [],
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
type AttendanceViewMode = 'list' | 'calendar';

const pad = (n: number) => String(n).padStart(2, '0');
const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const monthEnd = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (value: string | null) =>
  value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--';

interface CalendarDay {
  date: string;
  count: number;
  members: AttendanceRecord[];
}

const Attendance: React.FC = () => {
  const [summary, setSummary] = useState<AttendanceSummary>(DEFAULT_SUMMARY);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null);
  const [memberHistory, setMemberHistory] = useState<AttendanceRecord[]>([]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [manualMemberId, setManualMemberId] = useState('');
  const [manualCheckInError, setManualCheckInError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<AttendanceViewMode>('list');
  const [calendarMonth, setCalendarMonth] = useState(monthStart(new Date()));
  const [calendarRecords, setCalendarRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(new Date()));

  const loadListData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryPayload, recordsPayload] = await Promise.all([
        fetchAdminAttendanceSummary(),
        fetchAdminAttendance({ per_page: 25 }),
      ]);
      setSummary(summaryPayload);
      setRecords(recordsPayload.data);
    } catch (err) {
      setSummary(DEFAULT_SUMMARY);
      setRecords([]);
      setError(err instanceof Error ? err.message : 'Unable to load check-ins.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCalendarData = async (targetMonth: Date) => {
    const fromDate = toIsoDate(monthStart(targetMonth));
    const toDate = toIsoDate(monthEnd(targetMonth));

    setCalendarLoading(true);
    setError(null);

    try {
      const all: AttendanceRecord[] = [];
      let page = 1;
      let lastPage = 1;

      while (page <= lastPage) {
        const payload = await fetchAdminAttendance({
          date_from: fromDate,
          date_to: toDate,
          per_page: 100,
          page,
        });
        all.push(...payload.data);
        lastPage = payload.meta.last_page;
        page += 1;
      }

      setCalendarRecords(all);
      if (selectedDate < fromDate || selectedDate > toDate) {
        const today = toIsoDate(new Date());
        setSelectedDate(today >= fromDate && today <= toDate ? today : fromDate);
      }
    } catch (err) {
      setCalendarRecords([]);
      setError(err instanceof Error ? err.message : 'Unable to load monthly calendar data.');
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    loadListData();
  }, []);

  useEffect(() => {
    if (viewMode === 'calendar') {
      loadCalendarData(calendarMonth);
    }
  }, [viewMode, calendarMonth]);

  useEffect(() => {
    if ((!showCheckInModal && !activeRecord) || typeof document === 'undefined') return;

    const { body, documentElement } = document;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [showCheckInModal, activeRecord]);

  const openDetails = async (record: AttendanceRecord) => {
    setActiveRecord(record);
    try {
      const historyPayload = await fetchMemberAttendanceHistory(record.member_id, { per_page: 6 });
      setMemberHistory(historyPayload.data);
    } catch {
      setMemberHistory([]);
    }
  };

  const submitManualCheckIn = async () => {
    const memberId = Number(manualMemberId);
    if (!Number.isInteger(memberId) || memberId <= 0) {
      setManualCheckInError('A valid numeric member ID is required.');
      return;
    }

    setIsSubmitting(true);
    setManualCheckInError(null);
    setError(null);
    try {
      await checkInMemberAttendance({ member_id: memberId });
      setShowCheckInModal(false);
      setManualMemberId('');
      await loadListData();
      if (viewMode === 'calendar') {
        await loadCalendarData(calendarMonth);
      }
    } catch (err) {
      setManualCheckInError(err instanceof Error ? err.message : 'Unable to check in member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cards = useMemo(
    () => [
      { label: 'Total Active Members', value: String(summary.total_active_members) },
      { label: 'Total Expired Members', value: String(summary.total_expired_members) },
      { label: 'Members Expiring in 3 Days', value: String(summary.members_expiring_in_3_days) },
      { label: "Today's Total Check-Ins", value: String(summary.today_total_check_ins) },
    ],
    [summary]
  );

  const calendarMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const record of calendarRecords) {
      const existing = map.get(record.check_in_date);
      if (existing) {
        existing.count += 1;
        existing.members.push(record);
      } else {
        map.set(record.check_in_date, {
          date: record.check_in_date,
          count: 1,
          members: [record],
        });
      }
    }
    return map;
  }, [calendarRecords]);

  const monthTotalCheckIns = useMemo(() => calendarRecords.length, [calendarRecords]);
  const selectedDayData = useMemo(() => calendarMap.get(selectedDate), [calendarMap, selectedDate]);

  const calendarCells = useMemo(() => {
    const first = monthStart(calendarMonth);
    const daysInMonth = monthEnd(calendarMonth).getDate();
    const lead = (first.getDay() + 6) % 7;
    const rows: Array<{ empty: true } | { empty: false; day: number; date: string; count: number }> = [];

    for (let i = 0; i < lead; i++) rows.push({ empty: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = toIsoDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
      rows.push({
        empty: false,
        day,
        date,
        count: calendarMap.get(date)?.count ?? 0,
      });
    }
    while (rows.length % 7 !== 0) rows.push({ empty: true });
    return rows;
  }, [calendarMonth, calendarMap]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Check-Ins</h1>
          <p className="text-zinc-500 mt-1">Live gym activity and membership-aware access tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode((v) => (v === 'list' ? 'calendar' : 'list'))}
            className="px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-zinc-50 transition-all"
          >
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </button>
          <button
            onClick={() => {
              if (viewMode === 'calendar') {
                loadCalendarData(calendarMonth);
              } else {
                loadListData();
              }
            }}
            className="px-5 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-zinc-50 transition-all"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setManualCheckInError(null);
              setManualMemberId('');
              setShowCheckInModal(true);
            }}
            disabled={isSubmitting}
            className="px-5 py-3 bg-primary text-white rounded-2xl text-[10px] font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            Manual Check-In
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{card.label}</div>
            <div className="mt-3 text-3xl font-black text-zinc-900">{card.value}</div>
          </div>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100">
              <h2 className="text-xl font-black text-zinc-900">Recent Check-Ins</h2>
              <p className="text-sm text-zinc-400">Latest member check-in records.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/30 border-b border-zinc-100">
                    <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Member</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Time</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {records.length > 0 ? (
                    records.map((record) => (
                      <tr key={record.id} className="group hover:bg-zinc-50/50 transition-colors">
                        <td className="px-8 py-6 text-sm font-bold text-zinc-900">
                          {record.member?.full_name ?? `Member #${record.member_id}`}
                        </td>
                        <td className="px-8 py-6 text-sm text-zinc-500">{fmtDate(record.check_in_date)}</td>
                        <td className="px-8 py-6 text-sm text-zinc-500">{fmtTime(record.check_in_time)}</td>
                        <td className="px-8 py-6">
                          <button
                            onClick={() => openDetails(record)}
                            className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white transition-all"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-sm font-medium text-zinc-400">
                        {isLoading ? 'Loading check-ins...' : 'No check-in records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-zinc-900">Today&apos;s Check-Ins</h3>
            <p className="text-xs text-zinc-400 mb-4">Members checked in today.</p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {summary.today_check_ins.length > 0 ? (
                summary.today_check_ins.map((record) => (
                  <div key={record.id} className="rounded-xl border border-zinc-100 bg-zinc-50/40 px-3 py-2">
                    <div className="text-xs font-bold text-zinc-900">
                      {record.member?.full_name ?? `Member #${record.member_id}`}
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-500">
                      {fmtDate(record.check_in_date)} at {fmtTime(record.check_in_time)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-400">No check-ins yet today.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900">Monthly Check-In Calendar</h2>
                <p className="text-sm text-zinc-400">Track daily check-ins and open member list per day.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarMonth((m) => monthStart(new Date(m.getFullYear(), m.getMonth() - 1, 1)))}
                  className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
                >
                  Prev
                </button>
                <div className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-700 min-w-[150px] text-center">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setCalendarMonth((m) => monthStart(new Date(m.getFullYear(), m.getMonth() + 1, 1)))}
                  className="px-3 py-2 rounded-xl border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday} className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-2">
                    {weekday}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, index) => {
                  if (cell.empty) {
                    return <div key={`e-${index}`} className="h-24 rounded-xl border border-transparent" />;
                  }

                  const isSelected = selectedDate === cell.date;
                  const isToday = cell.date === toIsoDate(new Date());
                  return (
                    <button
                      key={cell.date}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`h-24 rounded-xl border p-3 text-left transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-zinc-100 bg-zinc-50/40 hover:bg-zinc-50'
                      }`}
                    >
                      <div className={`text-xs font-black ${isToday ? 'text-primary' : 'text-zinc-900'}`}>{cell.day}</div>
                      <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {cell.count} check-ins
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-zinc-900">Calendar Details</h3>
            <div className="mt-2 space-y-2 text-xs text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Month Total</span>
                <span className="font-bold text-zinc-900">{monthTotalCheckIns}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Selected Date</span>
                <span className="font-bold text-zinc-900">{fmtDate(selectedDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Day Total</span>
                <span className="font-bold text-zinc-900">{selectedDayData?.count ?? 0}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-100 pt-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Members for Selected Day</h4>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {calendarLoading ? (
                  <div className="text-xs text-zinc-400">Loading month data...</div>
                ) : selectedDayData && selectedDayData.members.length > 0 ? (
                  selectedDayData.members
                    .slice()
                    .sort((a, b) => new Date(b.check_in_time ?? '').getTime() - new Date(a.check_in_time ?? '').getTime())
                    .map((record) => (
                      <div key={record.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2">
                        <div className="text-xs font-bold text-zinc-900">{record.member?.full_name ?? `Member #${record.member_id}`}</div>
                        <div className="mt-1 text-[10px] text-zinc-500">Check-In: {fmtTime(record.check_in_time)}</div>
                      </div>
                    ))
                ) : (
                  <div className="text-xs text-zinc-400">No check-ins on this date.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {showCheckInModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative z-[121] bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Manual Check-In</h3>
                <p className="text-sm text-zinc-400">Enter member ID to record a new check-in.</p>
              </div>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900"
              >
                X
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitManualCheckIn();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Member ID</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={manualMemberId}
                  onChange={(event) => setManualMemberId(event.target.value)}
                  placeholder="e.g. 1024"
                  className="mt-2 w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>

              {manualCheckInError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                  {manualCheckInError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-5 py-3 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Checking In...' : 'Confirm Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {activeRecord && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative z-[121] bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl w-full max-w-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Check-In Details</h3>
                <p className="text-sm text-zinc-400">Member activity snapshot.</p>
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900"
              >
                X
              </button>
            </div>
            <div className="space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Member</span>
                <span className="font-semibold text-zinc-900">
                  {activeRecord.member?.full_name ?? `Member #${activeRecord.member_id}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Date</span>
                <span>{fmtDate(activeRecord.check_in_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Time</span>
                <span>{fmtTime(activeRecord.check_in_time)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                Recent Member Check-Ins
              </div>
              <div className="space-y-2">
                {memberHistory.length > 0 ? (
                  memberHistory.map((history) => (
                    <div key={history.id} className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{fmtDate(history.check_in_date)}</span>
                      <span>{fmtTime(history.check_in_time)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400">No recent check-in history found.</div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Attendance;
