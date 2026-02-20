'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LaporanPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [streak, setStreak] = useState(0);
    const [missedCount, setMissedCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('ramadan_streak_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.streak) setStreak(data.streak);

                // Calculate missed count
                if (data.replacements) {
                    setMissedCount(data.replacements.filter((r: any) => !r.completed).length);
                }

                // Process history
                if (data.history) {
                    const rawHistory = Object.values(data.history);
                    if (rawHistory.length > 0) {
                        const textToDate = (d: string) => {
                            const parts = d.split('/');
                            // Basic parsing attempt, fallback to generic date parsing
                            if (parts.length === 3 && parseInt(parts[2]) > 2000) {
                                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                            }
                            return new Date(d);
                        };

                        const sortedRaw = rawHistory.sort((a: any, b: any) => {
                            return textToDate(a.date).getTime() - textToDate(b.date).getTime();
                        });

                        // Set the official start date of Ramadan (e.g., 18 Feb 2026 for Malaysia)
                        let startDate = new Date(2026, 1, 18); // Month is 0-indexed, 1 = Feb

                        // If user has an earlier record (e.g. testing), start from there
                        const earliestRecord = textToDate((sortedRaw[0] as any).date);
                        if (!isNaN(earliestRecord.getTime()) && earliestRecord < startDate) {
                            startDate = earliestRecord;
                        }

                        // Also consider today as the end date
                        let endDate = new Date();

                        // Generate dates from startDate to endDate
                        const daysArray: any[] = [];
                        let currentDate = new Date(startDate);
                        let dayCount = 1;

                        while (currentDate <= endDate && dayCount <= 30) {
                            const dateStr = currentDate.toLocaleDateString();
                            const matchingEntry = rawHistory.find((entry: any) => entry.date === dateStr);

                            if (matchingEntry) {
                                daysArray.push({ ...(matchingEntry as any), isEmpty: false, dayNum: dayCount });
                            } else {
                                daysArray.push({
                                    date: dateStr,
                                    isEmpty: true,
                                    dayNum: dayCount,
                                    fasted: false,
                                    sahoor: false,
                                    prayerStatus: {},
                                    terawih: 0,
                                    diary: ""
                                });
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                            dayCount++;
                        }
                        setHistory(daysArray);
                    }
                }
            } catch (e) {
                console.error("Error loading report data", e);
            }
        }
    }, []);

    const countPrayers = (status: any) => {
        if (!status) return 0;
        return Object.values(status).filter(Boolean).length;
    };

    return (
        <div className="app animate-enter" style={{ minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '24px', marginRight: '15px' }}>←</Link>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--gold)' }}>Laporan Penuh</h1>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rekod Perjalanan Ramadan</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{streak}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🔥 Streak</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--red)' }}>{missedCount}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⚠️ Belum Ganti</div>
                </div>
            </div>

            {/* History List */}
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>Sejarah Harian</h3>

            {history.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>
                    Tiada rekod lagi. Teruskan beramal!
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                    {history.map((day, idx) => (
                        <div key={idx} className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden', opacity: day.isEmpty ? 0.6 : 1, filter: day.isEmpty ? 'grayscale(0.5)' : 'none' }}>
                            {/* Accent color top border if fasted vs not */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: day.isEmpty ? 'var(--text-dim)' : (day.fasted ? 'var(--gold)' : '#ff4d6d') }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginTop: '4px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '14px', color: day.isEmpty ? 'var(--text-muted)' : 'var(--text)' }}>📅 {day.date}</span>
                                {day.dayNum && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Hari {day.dayNum}</span>}
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: day.isEmpty ? 'var(--text-muted)' : (day.fasted ? 'var(--text)' : '#ff4d6d') }}>
                                {day.isEmpty ? '⚠️ Tiada Rekod' : (day.fasted ? '✅ Puasa' : '❌ Tak Puasa')}
                            </div>

                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', fontSize: '11px', opacity: day.isEmpty ? 0.5 : 1 }}>
                                <span style={{ background: 'var(--surface2)', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                    🥣 {day.sahoor ? '✓' : '✗'}
                                </span>
                                <span style={{ background: 'var(--surface2)', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                    🕌 {countPrayers(day.prayerStatus)}/5
                                </span>
                                <span style={{ background: 'var(--surface2)', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                    🌙 {day.terawih || 0}
                                </span>
                            </div>

                            {day.diary && (
                                <div style={{
                                    marginTop: 'auto', fontSize: '10px', fontStyle: 'italic', color: 'var(--text-dim)',
                                    background: 'var(--surface2)', padding: '6px 8px', borderRadius: '6px',
                                    borderLeft: '2px solid var(--gold)',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    "{day.diary}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Progress Bar Fixed Bottom? Nah just inline */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <div style={{ marginBottom: '5px', fontSize: '12px' }}>Progress Keseluruhan</div>
                <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (streak / 30) * 100)}%`, height: '100%', background: 'var(--gold)' }}></div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>{Math.round((streak / 30) * 100)}% siap</div>
            </div>

        </div>
    );
}
