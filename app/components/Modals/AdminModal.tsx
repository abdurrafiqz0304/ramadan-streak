import React from 'react';

interface AdminModalProps {
    showAdminLogin: boolean;
    setShowAdminLogin: (val: boolean) => void;
    adminPassword: string;
    setAdminPassword: (val: string) => void;
    handleAdminLogin: () => void;
}

export default function AdminModal({
    showAdminLogin,
    setShowAdminLogin,
    adminPassword,
    setAdminPassword,
    handleAdminLogin
}: AdminModalProps) {
    if (!showAdminLogin) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content animate-enter">
                <h3>Admin Login</h3>
                <input
                    type="password"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'white' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowAdminLogin(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--surface)', color: 'white', border: 'none' }}>Cancel</button>
                    <button onClick={handleAdminLogin} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--gold)', color: 'var(--surface)', border: 'none', fontWeight: 'bold' }}>Login</button>
                </div>
            </div>
        </div>
    );
}
