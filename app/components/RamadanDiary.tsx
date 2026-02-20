import React from 'react';

interface RamadanDiaryProps {
    diary: string;
    handleDiaryChange: (val: string) => void;
    showSubmitToast: boolean;
    setShowSubmitToast: (val: boolean) => void;
}

export default function RamadanDiary({
    diary,
    handleDiaryChange,
    showSubmitToast,
    setShowSubmitToast
}: RamadanDiaryProps) {
    return (
        <>
            <div id="diari"></div>
            <div className="section-label">Diari Ramadan</div>
            <div className="card animate-enter delay-300" style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
                    Tuliskan apa-apa sahaja yang anda rasa hari ini.
                </p>
                <textarea
                    value={diary}
                    onChange={(e) => handleDiaryChange(e.target.value)}
                    placeholder="Catatan hari ini... (cth: Perasaan, doa, atau checklist ibadah lain)"
                    style={{
                        width: '100%', height: '100px', padding: '12px', borderRadius: '12px',
                        background: 'var(--surface2)', border: 'none', color: 'var(--text)',
                        fontFamily: 'inherit', resize: 'vertical'
                    }}
                />
                <button
                    onClick={() => {
                        setShowSubmitToast(true);
                        setTimeout(() => setShowSubmitToast(false), 3000);
                    }}
                    disabled={!diary.trim()}
                    style={{
                        width: '100%', padding: '12px', marginTop: '10px', borderRadius: '12px',
                        background: diary.trim() ? 'var(--gold)' : 'var(--surface2)',
                        color: diary.trim() ? 'var(--bg)' : 'var(--text-muted)',
                        border: 'none', fontWeight: 'bold', cursor: diary.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                >
                    Hantar Diari
                </button>
                {showSubmitToast && (
                    <div style={{ marginTop: '10px', textAlign: 'center', color: 'var(--gold)', fontSize: '13px', animation: 'fadeIn 0.3s' }}>
                        ✓ Diari berjaya disimpan!
                    </div>
                )}
            </div>
        </>
    );
}
