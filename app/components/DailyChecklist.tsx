import React from 'react';
import { PrayerStatusType } from '../types';

interface DailyChecklistProps {
    isFastedToday: boolean;
    handleFastToday: () => void;
    handleMissedFast: () => void;
    sahoorDone: boolean;
    handleSahoorToggle: () => void;
    prayerStatus: Record<string, boolean>;
    togglePrayer: (key: string) => void;
}

export default function DailyChecklist({
    isFastedToday,
    handleFastToday,
    handleMissedFast,
    sahoorDone,
    handleSahoorToggle,
    prayerStatus,
    togglePrayer
}: DailyChecklistProps) {
    const prayersList = [
        { key: 'fajr', name: 'Subuh', emoji: '🌄' },
        { key: 'dhuhr', name: 'Zohor', emoji: '☀️' },
        { key: 'asr', name: 'Asar', emoji: '🌤' },
        { key: 'maghrib', name: 'Maghrib', emoji: '🌇' },
        { key: 'isha', name: 'Isyak', emoji: '🌙' },
    ];

    return (
        <>
            <div id="tracker"></div>
            <div className="section-label">Checklist Hari Ini</div>

            <div className="card animate-enter delay-200">
                {/* FASTING STATUS */}
                <div className={`fast-row ${isFastedToday ? 'checked row-checked' : ''}`} style={{ background: isFastedToday ? 'var(--checked-bg)' : 'transparent', transition: 'var(--transition)' }}>
                    <div className="fast-row-top">
                        <div className="fast-main" onClick={handleFastToday} style={{ cursor: 'pointer', flex: 1 }}>
                            <div className="tracker-icon" style={{ background: isFastedToday ? 'var(--gold)' : 'var(--surface3)' }}>🍽️</div>
                            <div className="tracker-info">
                                <strong style={{ color: isFastedToday ? 'var(--gold)' : 'var(--text)' }}>Puasa Hari Ini</strong>
                                <small>{isFastedToday ? 'Alhamdulillah, kekalkan' : 'Klik jika berjaya berpuasa'}</small>
                            </div>
                        </div>
                        {!isFastedToday && (
                            <div className="fast-btn-area">
                                <button onClick={(e) => { e.stopPropagation(); handleMissedFast(); }} className="fast-action-btn">Tak</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* SAHOOR STATUS */}
                <div className={`tracker-row ${sahoorDone ? 'checked row-checked' : ''}`} onClick={handleSahoorToggle}>
                    <div className="tracker-left">
                        <div className="tracker-icon">🥣</div>
                        <div className="tracker-info">
                            <strong>Sahur</strong>
                            <small>Sunnah yang berkat</small>
                        </div>
                    </div>
                    <div className="tracker-check"></div>
                </div>

                {/* PRAYER STATUSES */}
                {prayersList.map((p) => {
                    const isDone = prayerStatus[p.key as keyof PrayerStatusType];
                    return (
                        <div
                            key={p.key}
                            className={`prayer-time-row ${isDone ? 'done row-checked' : ''}`}
                            onClick={() => togglePrayer(p.key)}
                            style={{ background: isDone ? 'var(--checked-bg)' : 'transparent' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span className="prayer-time-emoji">{p.emoji}</span>
                                <span className="prayer-name">{p.name}</span>
                            </div>
                            <div className="prayer-chk"></div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
