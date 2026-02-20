import React from 'react';

// Need to pass ZONES from page.tsx or import it if extracted
interface LocationModalProps {
    showLocationModal: boolean;
    setShowLocationModal: (val: boolean) => void;
    selectedState: string;
    setSelectedState: (val: string) => void;
    userZone: string;
    handleZoneChange: (zone: string) => void;
    ZONES: any;
}

export default function LocationModal({
    showLocationModal,
    setShowLocationModal,
    selectedState,
    setSelectedState,
    userZone,
    handleZoneChange,
    ZONES
}: LocationModalProps) {
    if (!showLocationModal) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '350px', border: '1px solid var(--border)', maxHeight: '80vh', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text)', textAlign: 'center' }}>Pilih Kawasan</h3>

                {/* State Selector */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '12px' }}>Negeri</label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}
                    >
                        {Object.keys(ZONES).map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                {/* Zone Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px' }}>Zon (Klik untuk pilih)</label>
                    {ZONES[selectedState as keyof typeof ZONES]?.map((zone: any) => (
                        <button
                            key={zone.code}
                            onClick={() => handleZoneChange(zone.code)}
                            style={{
                                padding: '12px', borderRadius: '8px', border: 'none',
                                background: userZone === zone.code ? 'var(--gold)' : 'var(--surface2)',
                                color: userZone === zone.code ? 'var(--surface)' : 'var(--text)',
                                textAlign: 'left', fontSize: '13px', lineHeight: '1.4'
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{zone.code}</div>
                            <div style={{ opacity: 0.8 }}>{zone.name}</div>
                        </button>
                    ))}
                </div>

                <button onClick={() => setShowLocationModal(false)} style={{ marginTop: '20px', padding: '10px', width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px' }}>Tutup</button>
            </div>
        </div>
    );
}
