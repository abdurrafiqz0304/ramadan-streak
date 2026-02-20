import React from 'react';

interface ReasonModalProps {
    showReasonModal: boolean;
    setShowReasonModal: (val: boolean) => void;
    confirmMissedFast: (reason: string) => void;
}

export default function ReasonModal({
    showReasonModal,
    setShowReasonModal,
    confirmMissedFast
}: ReasonModalProps) {
    if (!showReasonModal) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '320px', border: '1px solid var(--border)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text)' }}>Kenapa tidak berpuasa?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => confirmMissedFast("Musafir")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>✈️ Musafir</button>
                    <button onClick={() => confirmMissedFast("Uzur")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>🩸 Uzur</button>
                    <button onClick={() => confirmMissedFast("Terbatal")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>❌ Terbatal</button>
                    <button onClick={() => confirmMissedFast("Lain-lain")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>📝 Lain-lain</button>
                </div>
                <button onClick={() => setShowReasonModal(false)} style={{ marginTop: '16px', padding: '10px', width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px' }}>Batal</button>
            </div>
        </div>
    );
}
