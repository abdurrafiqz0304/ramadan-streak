'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GantiPuasaPage() {
    const [replacementList, setReplacementList] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('ramadan_streak_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.replacements) {
                    setReplacementList(data.replacements);
                }
            } catch (e) {
                console.error("Error loading replacement data", e);
            }
        }
    }, []);

    const toggleReplacement = (id: number) => {
        const updatedList = replacementList.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setReplacementList(updatedList);

        // Save back to localStorage
        const saved = localStorage.getItem('ramadan_streak_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const newData = { ...data, replacements: updatedList };
                localStorage.setItem('ramadan_streak_data', JSON.stringify(newData));
            } catch (e) {
                console.error("Error saving replacement data", e);
            }
        }
    };

    const pendingCount = replacementList.filter(r => !r.completed).length;
    const completedCount = replacementList.filter(r => r.completed).length;

    return (
        <div className="app animate-enter" style={{ minHeight: '100vh', padding: '20px', paddingBottom: '80px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '24px', marginRight: '15px' }}>←</Link>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--gold)' }}>Ganti Puasa</h1>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Senarai Puasa Yang Perlu Diganti</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--red)' }}>{pendingCount}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⚠️ Belum Ganti</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--gold)' }}>{completedCount}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✅ Telah Diganti</div>
                </div>
            </div>

            {/* List */}
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>Senarai Rekod</h3>

            {replacementList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>
                    Alhamdulillah, tiada puasa perlu diganti!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {replacementList.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)).map((item) => (
                        <div
                            key={item.id}
                            className={`tracker-row ${item.completed ? 'row-checked' : ''}`}
                            onClick={() => toggleReplacement(item.id)}
                            style={{ opacity: item.completed ? 0.6 : 1 }}
                        >
                            <div className="tracker-left">
                                <div className="tracker-icon" style={{ filter: item.completed ? 'grayscale(1)' : 'none' }}>📅</div>
                                <div className="tracker-info">
                                    <strong style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.date}</strong>
                                    <small>{item.reason}</small>
                                </div>
                            </div>
                            <div className={`tracker-check ${item.completed ? 'checked' : ''}`} style={{ background: item.completed ? 'var(--gold)' : 'transparent', borderColor: item.completed ? 'var(--gold)' : 'var(--border)' }}></div>
                        </div>
                    ))}
                </div>
            )}

            {pendingCount > 0 && (
                <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Klik pada hari untuk menanda puasa telah diganti.
                </div>
            )}
        </div>
    );
}
