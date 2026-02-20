import React from 'react';

interface TerawihTrackerProps {
    terawihCount: number | string;
    handleTerawih: (count: number | string) => void;
    isCustomTerawih: boolean;
    setIsCustomTerawih: (val: boolean) => void;
    customTerawih: string;
    setCustomTerawih: (val: string) => void;
    handleCustomTerawihSave: () => void;
}

export default function TerawihTracker({
    terawihCount,
    handleTerawih,
    isCustomTerawih,
    setIsCustomTerawih,
    customTerawih,
    setCustomTerawih,
    handleCustomTerawihSave
}: TerawihTrackerProps) {
    return (
        <>
            <div id="terawih"></div>
            <div className="section-label">Terawih</div>
            <div className="card animate-enter delay-300" style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
                    Tandakan bilangan rakaat terawih anda malam ini.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                        onClick={() => handleTerawih(8)}
                        style={{
                            padding: '16px', borderRadius: '12px', border: '1px solid',
                            borderColor: terawihCount === 8 ? 'var(--gold)' : 'var(--border)',
                            background: terawihCount === 8 ? 'var(--gold-glow)' : 'var(--surface2)',
                            color: terawihCount === 8 ? 'var(--gold)' : 'var(--text)',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>8</span>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>Rakaat</span>
                    </button>

                    <button
                        onClick={() => handleTerawih(20)}
                        style={{
                            padding: '16px', borderRadius: '12px', border: '1px solid',
                            borderColor: terawihCount === 20 ? 'var(--gold)' : 'var(--border)',
                            background: terawihCount === 20 ? 'var(--gold-glow)' : 'var(--surface2)',
                            color: terawihCount === 20 ? 'var(--gold)' : 'var(--text)',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>20</span>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>Rakaat</span>
                    </button>

                    <button
                        onClick={() => setIsCustomTerawih(true)}
                        style={{
                            padding: '16px', borderRadius: '12px', border: '1px solid',
                            borderColor: (terawihCount !== 0 && terawihCount !== 8 && terawihCount !== 20) ? 'var(--gold)' : 'var(--border)',
                            background: (terawihCount !== 0 && terawihCount !== 8 && terawihCount !== 20) ? 'var(--gold-glow)' : 'var(--surface2)',
                            color: (terawihCount !== 0 && terawihCount !== 8 && terawihCount !== 20) ? 'var(--gold)' : 'var(--text)',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            gridColumn: 'span 2'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>
                            {(terawihCount !== 0 && terawihCount !== 8 && terawihCount !== 20) ? `${terawihCount} Rakaat` : 'Lain-lain'}
                        </span>
                    </button>
                </div>

                {isCustomTerawih && (
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px', animation: 'fadeIn 0.3s' }}>
                        <input
                            type="number"
                            value={customTerawih}
                            onChange={(e) => setCustomTerawih(e.target.value)}
                            placeholder="Jumlah rakaat..."
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--surface3)',
                                border: '1px solid var(--border)', color: 'var(--text)', outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleCustomTerawihSave}
                            style={{
                                padding: '0 20px', borderRadius: '8px', background: 'var(--gold)',
                                color: 'var(--bg)', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            Simpan
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
