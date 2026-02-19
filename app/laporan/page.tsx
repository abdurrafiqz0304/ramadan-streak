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
                    // Convert object to array and sort by date (newest first)
                    // stored date format is locale string... might be hard to sort if format varies.
                    // But let's assume it's roughly consistent or just reverse keys.
                    // actually, Object.values might be in insertion order.

                    // Better: sort by parsing date
                    const textToDate = (d: string) => {
                        const parts = d.split('/');
                        if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                        return new Date(d);
                    };

                    const arr = Object.values(data.history).sort((a: any, b: any) => {
                        return textToDate(b.date).getTime() - textToDate(a.date).getTime();
                    });
                    setHistory(arr);
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {history.map((day, idx) => (
                        <div key={idx} className="card" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>{day.date}</span>
                                <span>{day.fasted ? '✅ Berpuasa' : '❌ Tidak'}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Sahur: </span>
                                    {day.sahoor ? '✅' : '❌'}
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Solat: </span>
                                    {countPrayers(day.prayerStatus)}/5
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Terawih: </span>
                                    {day.terawih || 0}
                                </div>
                            </div>

                            {day.diary && (
                                <div style={{ marginTop: '10px', background: 'var(--surface2)', padding: '10px', borderRadius: '8px', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-dim)' }}>
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
