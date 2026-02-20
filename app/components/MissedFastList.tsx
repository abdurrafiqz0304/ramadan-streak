import React from 'react';
import { ReplacementDay } from '../types';

interface MissedFastListProps {
    replacementList: ReplacementDay[];
    toggleReplacement: (id: number) => void;
}

export default function MissedFastList({
    replacementList,
    toggleReplacement
}: MissedFastListProps) {
    const pendingReplacements = replacementList.filter(r => !r.completed);

    if (replacementList.length === 0) return null;

    return (
        <div className="card animate-enter delay-300" style={{ marginTop: '20px', padding: '20px' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>Ganti Puasa ({pendingReplacements.length})</div>
            {pendingReplacements.map(item => (
                <div key={item.id} className="tracker-row" onClick={() => toggleReplacement(item.id)}>
                    <div className="tracker-left">
                        <div className="tracker-icon">📅</div>
                        <div className="tracker-info">
                            <strong>{item.date}</strong>
                            <small>{item.reason}</small>
                        </div>
                    </div>
                    <div className="tracker-check"></div>
                </div>
            ))}
            {pendingReplacements.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Tiada puasa perlu diganti. Alhamdulillah!</div>
            )}
        </div>
    );
}
