import React from 'react';

interface SidebarProps {
    showSidebar: boolean;
    setShowSidebar: (val: boolean) => void;
    scrollToSection: (id: string) => void;
}

export default function Sidebar({
    showSidebar,
    setShowSidebar,
    scrollToSection
}: SidebarProps) {
    if (!showSidebar) return null;

    const sidebarLinkStyle = {
        textAlign: 'left' as 'left',
        padding: '12px',
        background: 'var(--surface2)',
        border: 'none',
        borderRadius: '8px',
        color: 'var(--text)',
        fontSize: '14px',
        cursor: 'pointer'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            animation: 'fadeIn 0.2s'
        }} onClick={() => setShowSidebar(false)}>
            <div style={{
                width: '280px', height: '100%', background: 'var(--surface)',
                boxShadow: 'var(--shadow)', padding: '20px',
                display: 'flex', flexDirection: 'column',
                animation: 'slideRight 0.3s'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, color: 'var(--gold)' }}>Menu</h2>
                    <button onClick={() => setShowSidebar(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '24px' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button onClick={() => scrollToSection('solat')} style={sidebarLinkStyle}>Query Waktu Solat</button>
                    <button onClick={() => scrollToSection('tracker')} style={sidebarLinkStyle}>Checklist & Sahur</button>
                    <button onClick={() => scrollToSection('terawih')} style={sidebarLinkStyle}>Terawih Tracker</button>
                    <button onClick={() => scrollToSection('diari')} style={sidebarLinkStyle}>Diari Ramadan</button>
                    <button onClick={() => window.location.href = '/laporan'} style={{ ...sidebarLinkStyle, color: 'var(--gold)', border: '1px solid var(--border-gold)' }}>📊 Laporan Penuh</button>
                    <button onClick={() => window.location.href = '/ganti'} style={{ ...sidebarLinkStyle, color: '#ff4d6d', border: '1px solid rgba(255, 77, 109, 0.3)' }}>⚠️ Ganti Puasa</button>
                </div>

                <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Ramadan Streak v5.4 <br />
                    Made with ❤️
                </div>
            </div>
        </div>
    );
}
