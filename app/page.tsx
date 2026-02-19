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

  useEffect(() => {
    fetchWaktuSolat();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoadingPrayer(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, long: longitude });
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
      setFastStreak(fastStreak + 1);
    }
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
                <button className="fast-action-btn confirm" onClick={handleFastToday}>✓ Puasa</button>
              ) : (
                <span className="fast-action-btn" style={{ border: 'none', background: 'transparent', color: 'var(--gold)' }}>Direkod</span>
              )}
            </div>
          </div>
        </div>

        <div className={`tracker-row ${sahoorDone ? "checked row-checked" : ""}`} onClick={() => setSahoorDone(!sahoorDone)}>
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
          <button onClick={detectLocation} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px' }}>
            📍 Set Lokasi
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
            {prayersList.map((p) => (
              <div key={p.key} className={`prayer-time-row ${nextPrayer === p.name ? 'prayer-next' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="prayer-time-emoji">{p.emoji}</span>
                  <span className="prayer-name">{p.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="prayer-time-val">{prayerTimes[p.key]}</span>
                  <div className="prayer-chk"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--red)' }}>
            ⚠️ Gagal mendapat waktu solat.
          </div>
        )}
      </div>

    </div>
  );
}