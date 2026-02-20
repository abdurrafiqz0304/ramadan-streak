import Link from 'next/link';
import React from 'react';

interface CalendarDay {
    dateStr: string;
    dayNum: number;
    dayName: string;
    dateVal: number;
    isPastOrToday: boolean;
    isToday: boolean;
}

interface HeroSectionProps {
    calendarDays: CalendarDay[];
    currentViewDate: string | null;
    setCurrentViewDate: (date: string) => void;
    fastStreak: number;
}

export default function HeroSection({
    calendarDays,
    currentViewDate,
    setCurrentViewDate,
    fastStreak
}: HeroSectionProps) {
    const isViewingPast = currentViewDate !== new Date().toLocaleDateString();

    return (
        <>
            {/* HORIZONTAL CALENDAR PICKER */}
            <div style={{
                display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '16px',
                marginBottom: '20px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                borderBottom: '1px solid var(--border)'
            }}>
                {calendarDays.map((calDay, i) => {
                    const isSelected = currentViewDate === calDay.dateStr;

                    return (
                        <button
                            key={i}
                            disabled={!calDay.isPastOrToday}
                            onClick={() => setCurrentViewDate(calDay.dateStr)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                minWidth: '56px', height: '64px', borderRadius: '16px',
                                background: isSelected ? 'var(--gold)' : 'var(--surface2)',
                                color: isSelected ? 'var(--bg)' : (calDay.isPastOrToday ? 'var(--text)' : 'var(--text-muted)'),
                                opacity: calDay.isPastOrToday ? 1 : 0.4,
                                border: calDay.isToday && !isSelected ? '1px solid var(--gold)' : '1px solid transparent',
                                cursor: calDay.isPastOrToday ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>
                                {calDay.dayName}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                {calDay.dateVal}
                            </span>
                            {/* Dot for today */}
                            {calDay.isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? 'var(--bg)' : 'var(--gold)', marginTop: '2px' }} />}
                        </button>
                    )
                })}
            </div>

            {/* Warning if viewing past date */}
            {isViewingPast && currentViewDate && (
                <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--gold)', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⏪</span>
                    <span>Anda sedang melihat / edit rekod hari sebelumnya. <b>(Tarikh: {currentViewDate})</b></span>
                </div>
            )}

            {/* HERO SECTION / STREAK */}
            <Link href="/laporan" style={{ textDecoration: 'none' }}>
                <div className="hero" style={{ marginTop: '10px' }}>
                    <div className="hero-label">Streak Puasa ✨</div>
                    <div className="hero-streak-row">
                        <div className="hero-num">{fastStreak}</div>
                        <div className="hero-unit">hari</div>
                        {fastStreak > 0 && <span className="animate-pulse" style={{ fontSize: '28px', marginLeft: '8px' }}>🔥</span>}
                    </div>
                    <div className="hero-bar-track" style={{ position: 'relative' }}>
                        <div className="hero-bar-fill" style={{ width: `${Math.min(100, (fastStreak / 30) * 100)}%` }}></div>
                        {/* Emojis floating on the streak bar */}
                        <span style={{ position: 'absolute', left: `${Math.min(100, (fastStreak / 30) * 100)}%`, top: '-14px', fontSize: '20px', transform: 'translateX(-50%)', transition: 'left 1s ease' }}>🌙</span>
                        <span style={{ position: 'absolute', right: '0%', top: '-14px', fontSize: '20px', transform: 'translateX(50%)' }}>🕌</span>
                    </div>
                    <div className="hero-bar-meta">
                        <span>Hari 1</span>
                        <span>Aidilfitri</span>
                    </div>
                </div>
            </Link>
        </>
    );
}
