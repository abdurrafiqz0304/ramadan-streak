import React from 'react';
import { PrayerTimesType } from '../types';

interface PrayerTimesWidgetProps {
    nextPrayer: string | null;
    timeToNextPrayer: string;
    prayerTimes: PrayerTimesType | null;
}

export default function PrayerTimesWidget({
    nextPrayer,
    timeToNextPrayer,
    prayerTimes
}: PrayerTimesWidgetProps) {
    const prayersList = [
        { key: 'fajr', name: 'Subuh', emoji: '🌄' },
        { key: 'dhuhr', name: 'Zohor', emoji: '☀️' },
        { key: 'asr', name: 'Asar', emoji: '🌤' },
        { key: 'maghrib', name: 'Maghrib', emoji: '🌇' },
        { key: 'isha', name: 'Isyak', emoji: '🌙' },
    ];

    return (
        <>
            {/* Next Prayer Countdown Widget */}
            {nextPrayer && (
                <div className="next-prayer-widget animate-enter delay-100">
                    <div className="next-prayer-label">Seterusnya</div>
                    <div className="next-prayer-name">{nextPrayer}</div>
                    <div className="next-prayer-time">{timeToNextPrayer}</div>
                </div>
            )}

            {/* Daily Prayer Times */}
            <div id="solat"></div>
            <div className="section-title">Waktu Solat</div>

            {prayerTimes ? (
                <div className="card animate-enter delay-200">
                    {prayersList.map((p) => {
                        const isNext = (nextPrayer === p.name) || (nextPrayer === 'Subuh Esok' && p.key === 'fajr');
                        return (
                            <div key={p.key} className={`prayer-time-row ${isNext ? 'prayer-next' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="prayer-time-emoji">{p.emoji}</span>
                                    <span className="prayer-name">{p.name}</span>
                                </div>
                                <div className="prayer-time-val">
                                    {prayerTimes[p.key as keyof PrayerTimesType] || '--:--'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card animate-enter delay-200" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Memuatkan waktu solat...
                </div>
            )}
        </>
    );
}
