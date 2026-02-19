"use client";

import { useState, useEffect } from "react";

export default function RamadanStreak() {
  const [fastStreak, setFastStreak] = useState(0);
  const [isFastedToday, setIsFastedToday] = useState(false);
  const [sahoorDone, setSahoorDone] = useState(false);

  // State untuk Waktu Solat
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState<string>("");
  const [userZone, setUserZone] = useState<string>("PHG03");
  const [coords, setCoords] = useState<{ lat: number, long: number } | null>(null);

  // Missed Fast Logic
  interface ReplacementDay {
    id: number;
    date: string;
    reason: string;
    completed: boolean;
  }
  const [replacementList, setReplacementList] = useState<ReplacementDay[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [missedReason, setMissedReason] = useState<string>("");

  // Admin / Dev Tools State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Prayer Status Checklist
  const [prayerStatus, setPrayerStatus] = useState<Record<string, boolean>>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  });

  const togglePrayer = (key: string) => {
    const newStatus = { ...prayerStatus, [key]: !prayerStatus[key] };
    setPrayerStatus(newStatus);
    saveDataToStorage(newStatus, fastStreak, isFastedToday, sahoorDone, replacementList);
  };

  const fetchWaktuSolat = async (latitude?: number, longitude?: number) => {
    setLoadingPrayer(true);
    try {
      let url = '/api/prayer-times?zone=PHG03';
      if (latitude && longitude) {
        url = `/api/prayer-times?lat=${latitude}&long=${longitude}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();

      if (json.zone) setUserZone(json.zone);

      if (json.prayerTime && json.prayerTime.length > 0) {
        const waktuHariIni = json.prayerTime[0];
        setPrayerTimes({
          fajr: waktuHariIni.fajr.substring(0, 5),
          dhuhr: waktuHariIni.dhuhr.substring(0, 5),
          asr: waktuHariIni.asr.substring(0, 5),
          maghrib: waktuHariIni.maghrib.substring(0, 5),
          isha: waktuHariIni.isha.substring(0, 5),
        });
      }
    } catch (error) {
      console.error("Gagal tarik waktu solat", error);
    } finally {
      setLoadingPrayer(false);
    }
  };



  // Local Storage Logic
  const saveDataToStorage = (pStatus: any, streak: number, fasted: boolean, sahoor: boolean, replacements: ReplacementDay[]) => {
    if (typeof window === 'undefined') return;
    const data = {
      date: new Date().toLocaleDateString(),
      streak,
      fasted,
      sahoor,
      prayers: pStatus,
      replacements
    };
    localStorage.setItem('ramadan_streak_data', JSON.stringify(data));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ramadan_streak_data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const today = new Date().toLocaleDateString();

          if (data.date === today) {
            // Restore today's progress
            setFastStreak(data.streak || 0);
            setIsFastedToday(data.fasted || false);
            setSahoorDone(data.sahoor || false);
            setPrayerStatus(data.prayers || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
            setReplacementList(data.replacements || []);
          } else {
            // New Day: Reset daily trackers but keep streak
            setFastStreak(data.streak || 0); // Logic could be added here to reset streak if missed
            setIsFastedToday(false);
            setSahoorDone(false);
            setPrayerStatus({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
            setReplacementList(data.replacements || []);
            // Save reset state immediately
            saveDataToStorage({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }, data.streak || 0, false, false, data.replacements || []);
          }
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      }
    }

    // Check for cached location
    const savedLoc = localStorage.getItem('ramadan_user_location');
    if (savedLoc) {
      try {
        const { lat, long } = JSON.parse(savedLoc);
        setCoords({ lat, long });
        fetchWaktuSolat(lat, long);
      } catch (e) {
        console.error("Error parsing saved location");
        fetchWaktuSolat(); // Fallback to default
      }
    } else {
      fetchWaktuSolat(); // No cache, load default
    }
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoadingPrayer(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, long: longitude });

          // Save to cache
          if (typeof window !== 'undefined') {
            localStorage.setItem('ramadan_user_location', JSON.stringify({ lat: latitude, long: longitude }));
          }

          fetchWaktuSolat(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Gagal mengesan lokasi. Sila pastikan GPS dihidupkan.");
          setLoadingPrayer(false);
        }
      );
    } else {
      alert("Pelayar anda tidak menyokong geolokasi.");
    }
  };

  // Countdown Logic
  useEffect(() => {
    if (!prayerTimes) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const times = [
        { key: 'fajr', name: 'Subuh', time: prayerTimes.fajr },
        { key: 'dhuhr', name: 'Zohor', time: prayerTimes.dhuhr },
        { key: 'asr', name: 'Asar', time: prayerTimes.asr },
        { key: 'maghrib', name: 'Maghrib', time: prayerTimes.maghrib },
        { key: 'isha', name: 'Isyak', time: prayerTimes.isha },
      ];

      let upcoming = null;

      for (const t of times) {
        const [h, m] = t.time.split(':').map(Number);
        const pTime = h * 60 + m;
        if (pTime > currentTime) {
          upcoming = t;
          break;
        }
      }

      // If no upcoming prayer today, it means next is Fajr tomorrow (simplified logic)
      if (!upcoming) {
        upcoming = { key: 'fajr', name: 'Subuh Esok', time: times[0].time };
      }

      setNextPrayer(upcoming.name);

      const [h, m] = upcoming.time.split(':').map(Number);
      let targetTime = new Date();
      targetTime.setHours(h, m, 0, 0);

      if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const diff = targetTime.getTime() - now.getTime();
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeToNextPrayer(`${hours}j ${minutes}m ${seconds}s`);

    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  const handleFastToday = () => {
    if (!isFastedToday) {
      setIsFastedToday(true);
      const newStreak = fastStreak + 1;
      setFastStreak(newStreak);
      saveDataToStorage(prayerStatus, newStreak, true, sahoorDone, replacementList);
    }
  };

  const handleSahoorToggle = () => {
    const newState = !sahoorDone;
    setSahoorDone(newState);
    saveDataToStorage(prayerStatus, fastStreak, isFastedToday, newState, replacementList);
  };

  const handleMissedFast = () => {
    setShowReasonModal(true);
  };

  const confirmMissedFast = (reason: string) => {
    let newReplacements = [...replacementList];
    const today = new Date();

    if (reason === "Haid") {
      // Add 7 days starting from today
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        newReplacements.push({
          id: Date.now() + i,
          date: date.toLocaleDateString(),
          reason: "Haid",
          completed: false
        });
      }
    } else {
      // Add only today
      newReplacements.push({
        id: Date.now(),
        date: today.toLocaleDateString(),
        reason: reason,
        completed: false
      });
    }

    setReplacementList(newReplacements);
    setFastStreak(0); // Reset streak
    setIsFastedToday(false); // Mark as not fasted
    setShowReasonModal(false);

    // Save everything
    saveDataToStorage(prayerStatus, 0, false, sahoorDone, newReplacements);
  };

  const toggleReplacement = (id: number) => {
    const updatedList = replacementList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setReplacementList(updatedList);
    saveDataToStorage(prayerStatus, fastStreak, isFastedToday, sahoorDone, updatedList);
  };

  // ADMIN TOOLS
  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword("");
    } else {
      alert("Salah password!");
    }
  };

  // DEV TOOLS HANDLERS
  const devReset = () => {
    if (confirm("Reset semua data?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const devStreak = (amount: number) => {
    const newStreak = Math.max(0, fastStreak + amount);
    setFastStreak(newStreak);
    saveDataToStorage(prayerStatus, newStreak, isFastedToday, sahoorDone, replacementList);
  };

  const devNewDay = () => {
    const newStreak = fastStreak; // Keep streak
    setIsFastedToday(false);
    setSahoorDone(false);
    setPrayerStatus({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
    saveDataToStorage({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }, newStreak, false, false, replacementList);
    alert("Simulated New Day! (Streak preserved, checked items reset)");
  };

  const prayersList = [
    { key: 'fajr', name: 'Subuh', emoji: '🌄' },
    { key: 'dhuhr', name: 'Zohor', emoji: '☀️' },
    { key: 'asr', name: 'Asar', emoji: '🌤' },
    { key: 'maghrib', name: 'Maghrib', emoji: '🌇' },
    { key: 'isha', name: 'Isyak', emoji: '🌙' },
  ];

  return (
    <div className="app animate-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-brand">
          <span className="brand-name">Ramadan</span>
          <span className="brand-year">1447 AH</span>
        </div>
      </div>

      {/* Hero streak */}
      <div className="hero">
        <div className="hero-label">Streak Puasa</div>
        <div className="hero-streak-row">
          <div className="hero-num">{fastStreak}</div>
          <div className="hero-unit">hari</div>
          {fastStreak > 0 && <span className="animate-pulse" style={{ fontSize: '24px', marginLeft: '8px' }}>🔥</span>}
        </div>
        <div className="hero-bar-track">
          <div className="hero-bar-fill" style={{ width: `${(fastStreak / 30) * 100}%` }}></div>
        </div>
        <div className="hero-bar-meta">
          <span>Hari 1</span>
          <span>Eid</span>
        </div>
      </div>

      {/* Next Prayer Countdown Widget */}
      {nextPrayer && (
        <div className="next-prayer-widget animate-enter delay-100">
          <div className="next-prayer-label">Seterusnya</div>
          <div className="next-prayer-name">{nextPrayer}</div>
          <div className="next-prayer-time">{timeToNextPrayer}</div>
        </div>
      )}

      <div className="section-label">Hari Ini</div>

      {/* Today tracker card */}
      <div className="card animate-enter delay-200">
        <div className="fast-row">
          <div className="fast-row-top">
            <div className="fast-main">
              <div className="tracker-icon">🌙</div>
              <div className="tracker-info">
                <strong>{isFastedToday ? "Berpuasa ✓" : "Puasa Hari Ini"}</strong>
                <small>{isFastedToday ? "Barakallahu feek! Teruskan!" : "Konfirmasi puasa anda hari ini"}</small>
              </div>
            </div>
            <div className="fast-btn-area">
              {!isFastedToday ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="fast-action-btn confirm" onClick={handleFastToday}>✓ Puasa</button>
                  <button className="fast-action-btn" onClick={handleMissedFast} style={{ background: 'var(--red)', color: 'white', opacity: 0.8 }}>× Tak</button>
                </div>
              ) : (
                <span className="fast-action-btn" style={{ border: 'none', background: 'transparent', color: 'var(--gold)' }}>Direkod</span>
              )}
            </div>
          </div>
        </div>

        <div className={`tracker-row ${sahoorDone ? "checked row-checked" : ""}`} onClick={handleSahoorToggle}>
          <div className="tracker-left">
            <div className="tracker-icon">🌅</div>
            <div className="tracker-info">
              <strong>Sahoor</strong>
              <small>Makan sebelum subuh</small>
            </div>
          </div>
          <div className="tracker-check"></div>
        </div>
      </div>

      {/* BAHAGIAN WAKTU SOLAT */}
      <div className="section-label flex justify-between items-center">
        <span>Waktu Solat</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={detectLocation} disabled={loadingPrayer} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', opacity: loadingPrayer ? 0.7 : 1 }}>
            {loadingPrayer ? '🛰️ Mencari...' : '📍 Set Lokasi'}
          </button>
          <span style={{ fontSize: '10px', background: 'var(--surface2)', padding: '2px 6px', borderRadius: '4px' }}>{userZone}</span>
        </div>
      </div>

      <div className="card prayer-times-card animate-enter delay-300">
        {loadingPrayer ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>⏳</div>
            <br />Mengambil jadual...
          </div>
        ) : prayerTimes ? (
          <div>
            {prayersList.map((p) => <div key={p.key} className={`prayer-time-row ${nextPrayer === p.name ? 'prayer-next' : ''} ${prayerStatus[p.key] ? 'done' : ''}`} onClick={() => togglePrayer(p.key)}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="prayer-time-emoji">{p.emoji}</span>
                <span className="prayer-name">{p.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="prayer-time-val">{prayerTimes[p.key]}</span>
                <div className="prayer-chk"></div>
              </div>
            </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--red)' }}>
            ⚠️ Gagal mendapat waktu solat.
          </div>
        )}
      </div>

      {/* GANTI PUASA LIST */}
      {replacementList.length > 0 && (
        <div className="card animate-enter delay-300" style={{ marginTop: '20px' }}>
          <div className="section-label" style={{ marginBottom: '16px' }}>Ganti Puasa ({replacementList.filter(r => !r.completed).length})</div>
          {replacementList.filter(r => !r.completed).map(item => (
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
          {replacementList.filter(r => !r.completed).length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>Tiada puasa perlu diganti. Alhamdulillah!</div>
          )}
        </div>
      )}

      {/* REASON MODAL */}
      {showReasonModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999
        }}>
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '320px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text)' }}>Kenapa tidak berpuasa?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => confirmMissedFast("Musafir")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>✈️ Musafir</button>
              <button onClick={() => confirmMissedFast("Haid")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>🩸 Haid (Auto 7 hari)</button>
              <button onClick={() => confirmMissedFast("Terbatal")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>❌ Terbatal</button>
              <button onClick={() => confirmMissedFast("Lain-lain")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>📝 Lain-lain</button>
            </div>
            <button onClick={() => setShowReasonModal(false)} style={{ marginTop: '16px', padding: '10px', width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
        v1.4 <span onClick={() => setShowAdminLogin(true)} style={{ cursor: 'pointer', opacity: 0.3 }}>🔒</span>
      </div>

      {/* DEV TOOLS (Protected) */}
      {isAdmin && (
        <div style={{ marginTop: '40px', borderTop: '1px dashed var(--border)', paddingTop: '20px', animation: 'fadeIn 0.5s' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>🛠️ Admin Panel</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={devReset} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '6px' }}>
              🗑️ Reset
            </button>
            <button onClick={() => devStreak(1)} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--surface2)', color: 'var(--text)', border: 'none', borderRadius: '6px' }}>
              ➕ Streak
            </button>
            <button onClick={() => devStreak(-1)} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--surface2)', color: 'var(--text)', border: 'none', borderRadius: '6px' }}>
              ➖ Streak
            </button>
            <button onClick={devNewDay} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--surface2)', color: 'var(--text)', border: 'none', borderRadius: '6px' }}>
              🔄 New Day
            </button>
            <button onClick={() => setIsAdmin(false)} style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              🔒 Lock
            </button>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {showAdminLogin && !isAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '16px', width: '80%', maxWidth: '300px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text)', textAlign: 'center' }}>Admin Access</h3>
            <input
              type="password"
              placeholder="Enter Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAdminLogin(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px' }}>Cancel</button>
              <button onClick={handleAdminLogin} style={{ flex: 1, padding: '10px', background: 'var(--gold)', border: 'none', color: 'var(--surface)', borderRadius: '8px', fontWeight: 'bold' }}>Login</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}