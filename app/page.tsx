"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { ZONES } from './data/zones';

export default function Home() {
  const [fastStreak, setFastStreak] = useState(0);
  const [isFastedToday, setIsFastedToday] = useState(false);
  const [sahoorDone, setSahoorDone] = useState(false);

  // Current Date View Logic
  const [currentViewDate, setCurrentViewDate] = useState<string>("");
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  useEffect(() => {
    setCurrentViewDate(new Date().toLocaleDateString());
  }, []);

  // State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("Pahang");

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

  // Terawih State
  const [terawihCount, setTerawihCount] = useState<number | string>(0);
  const [customTerawih, setCustomTerawih] = useState<string>("");
  const [isCustomTerawih, setIsCustomTerawih] = useState(false);

  // Diary State
  const [diary, setDiary] = useState<string>("");

  // Sidebar & Report State
  const [showSidebar, setShowSidebar] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [history, setHistory] = useState<Record<string, any>>({});

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

  // Location Modal Handler
  const handleZoneChange = (zone: string) => {
    setUserZone(zone);
    setCoords(null); // Clear coordinates to favor Zone

    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('ramadan_user_location', JSON.stringify({ zone: zone, type: 'manual' }));
    }

    setShowLocationModal(false);

    // Fetch new times
    setLoadingPrayer(true);
    fetch(`/api/prayer-times?zone=${zone}`)
      .then(res => res.json())
      .then(json => {
        // ... simplify fetch logic to reuse ...
        // For now just triggering a reload might be safer/easier or calling fetchWaktuSolat with just zone updates
        // But fetchWaktuSolat relies on args.
        // Let's refactor fetchWaktuSolat slightly or just manually set state here.
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
        setLoadingPrayer(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingPrayer(false);
      });
  };

  const togglePrayer = (key: string) => {
    const newStatus = { ...prayerStatus, [key]: !prayerStatus[key] };
    setPrayerStatus(newStatus);
    saveDataToStorage(newStatus, fastStreak, isFastedToday, sahoorDone, replacementList, terawihCount, diary);
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
  // Local Storage Logic
  const saveDataToStorage = (pStatus: any, streak: number, fasted: boolean, sahoor: boolean, replacements: ReplacementDay[], terawih: number | string, diaryEntry: string) => {
    if (typeof window === 'undefined') return;

    // Save under the currently viewed date, not strictly 'today'
    const recordDate = currentViewDate || new Date().toLocaleDateString();

    const currentDayData = {
      date: recordDate,
      fasted,
      sahoor,
      prayerStatus: pStatus,
      replacements,
      terawih,
      diary: diaryEntry
    };

    // Load existing history to append/update
    let currentHistory = history;
    // If history state is empty (initial load issue), try to read from storage first? 
    // Better: relies on state 'history' being up to date. 
    // actually, let's read from storage to be safe or use the state if guaranteed.
    // simpler: just use the parameter 'history' (wait, I can't pass history everywhere easily).
    // Let's read from localStorage directly to ensure we have latest history

    let savedHistory: Record<string, any> = {};
    try {
      const existing = localStorage.getItem('ramadan_streak_data');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.history) savedHistory = parsed.history;
      }
    } catch (e) { }

    const newHistory = { ...savedHistory, [recordDate]: currentDayData };

    // Recalculate global streak
    let calculatedStreak = 0;
    const startOfRamadan = new Date(2026, 1, 18);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    let checkDate = new Date(todayDate);
    const todayStr = todayDate.toLocaleDateString();

    while (checkDate >= startOfRamadan) {
      const dateStr = checkDate.toLocaleDateString();
      const dayData = newHistory[dateStr];

      if (dayData && dayData.fasted) {
        calculatedStreak++;
      } else if (dateStr === todayStr && !dayData) {
        // If today is entirely empty (not filled yet), don't break the streak
        // just continue checking yesterday
      } else {
        // Break streak on an explicitly missed day, or an empty past day
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    setFastStreak(calculatedStreak);
    setHistory(newHistory); // Update state

    // Ensure backwards compatibility with old 'streak' top-level key
    const data = {
      ...currentDayData,
      streak: calculatedStreak,
      history: newHistory
    };
    localStorage.setItem('ramadan_streak_data', JSON.stringify(data));
  };

  useEffect(() => {
    // Load data
    const savedData = localStorage.getItem('ramadan_streak_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const today = new Date().toLocaleDateString();

        // Load persistent data regardless of date
        if (parsed.streak) setFastStreak(parsed.streak);
        if (parsed.replacements) setReplacementList(parsed.replacements);
        if (parsed.history) setHistory(parsed.history);

        if (parsed.date === today) {
          if (parsed.fasted) setIsFastedToday(parsed.fasted);
          if (parsed.sahoor) setSahoorDone(parsed.sahoor);
          if (parsed.prayerStatus) setPrayerStatus(parsed.prayerStatus);
          if (parsed.terawih) setTerawihCount(parsed.terawih);
          if (parsed.diary) setDiary(parsed.diary);
        } else {
          // New Day: Reset daily trackers but keep streak
          // We don't save reset here to avoid overwriting before user sees it?
          // Actually, we should just not load the old daily status
        }
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }

    // Load user zone pref
    const savedLoc = localStorage.getItem('ramadan_user_location');
    if (savedLoc) {
      try {
        const locData = JSON.parse(savedLoc);
        if (locData.zone) {
          setUserZone(locData.zone);
          setLoadingPrayer(true);
          fetch(`/api/prayer-times?zone=${locData.zone}`)
            .then(res => res.json())
            .then(json => {
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
              setLoadingPrayer(false);
            })
            .catch(() => setLoadingPrayer(false));
        } else if (locData.lat && locData.long) {
          setCoords({ lat: locData.lat, long: locData.long });
          fetchWaktuSolat(locData.lat, locData.long);
        } else {
          detectLocation();
        }
      } catch (e) {
        detectLocation();
      }
    } else {
      detectLocation();
    }
  }, []);

  // Handle Current View Date Changes
  useEffect(() => {
    if (!currentViewDate) return;

    const savedData = localStorage.getItem('ramadan_streak_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Load global state
        if (parsed.streak) setFastStreak(parsed.streak);
        if (parsed.replacements) setReplacementList(parsed.replacements);
        if (parsed.history) setHistory(parsed.history);

        // Load specific day state
        if (parsed.history && parsed.history[currentViewDate]) {
          const dayData = parsed.history[currentViewDate];
          setIsFastedToday(dayData.fasted || false);
          setSahoorDone(dayData.sahoor || false);
          setPrayerStatus(dayData.prayerStatus || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
          setTerawihCount(dayData.terawih || 0);
          setDiary(dayData.diary || "");
        } else {
          // Empty day
          setIsFastedToday(false);
          setSahoorDone(false);
          setPrayerStatus({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
          setTerawihCount(0);
          setDiary("");
        }
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }

    // Generate Calendar Days Array (from Start of Ramadan to End of Month)
    // For simplicity, let's just generate 30 days starting Feb 18, 2026.
    const startOfRamadan = new Date(2026, 1, 18);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today

    let days = [];
    let d = new Date(startOfRamadan);
    for (let i = 0; i < 30; i++) {
      const isPastOrToday = d <= today;
      days.push({
        dateStr: d.toLocaleDateString(),
        dayNum: i + 1,
        dayName: d.toLocaleDateString('ms-MY', { weekday: 'short' }), // e.g., Isnh, Sel
        dateVal: d.getDate(),
        isPastOrToday: isPastOrToday,
        isToday: d.toLocaleDateString() === new Date().toLocaleDateString()
      });
      d.setDate(d.getDate() + 1);
    }
    setCalendarDays(days);

  }, [currentViewDate]);

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
      saveDataToStorage(prayerStatus, newStreak, true, sahoorDone, replacementList, terawihCount, diary);
    }
  };

  const handleSahoorToggle = () => {
    const newState = !sahoorDone;
    setSahoorDone(newState);
    saveDataToStorage(prayerStatus, fastStreak, isFastedToday, newState, replacementList, terawihCount, diary);
  };

  const handleTerawih = (count: number | string) => {
    const newCount = terawihCount === count ? 0 : count; // Toggle if same, else set
    setTerawihCount(newCount);
    setIsCustomTerawih(false); // Reset custom state if standard option clicked
    saveDataToStorage(prayerStatus, fastStreak, isFastedToday, sahoorDone, replacementList, newCount, diary);
  };

  const handleCustomTerawihSave = () => {
    if (customTerawih.trim()) {
      const val = customTerawih.trim();
      setTerawihCount(val);
      setIsCustomTerawih(false);
      saveDataToStorage(prayerStatus, fastStreak, isFastedToday, sahoorDone, replacementList, val, diary);
    }
  };

  const handleDiaryChange = (val: string) => {
    setDiary(val);
    saveDataToStorage(prayerStatus, fastStreak, isFastedToday, sahoorDone, replacementList, terawihCount, val);
  };

  const handleMissedFast = () => {
    setShowReasonModal(true);
  };

  const confirmMissedFast = (reason: string) => {
    let dayToLog: ReplacementDay[] = [];

    // Jika "Uzur", log 1 hari sahaja (seperti feedback user)
    // Jika "Haid" (legacy code) or others, log 1 hari.
    // Logic: always 1 entry per click for now as per feedback.

    // Create new entry
    const recordDate = currentViewDate || new Date().toLocaleDateString();
    const newEntry: ReplacementDay = {
      id: Date.now(),
      date: recordDate,
      reason: reason,
      completed: false
    };

    const updatedList = [...replacementList, newEntry];
    setReplacementList(updatedList);

    setIsFastedToday(false); // Reset fast status if they add missed fast
    setShowReasonModal(false);
    saveDataToStorage(prayerStatus, fastStreak, false, sahoorDone, updatedList, terawihCount, diary);

    alert(`Rekod tidak puasa (${reason}) ditambah. Jangan lupa ganti ya!`);
  };

  const toggleReplacement = (id: number) => {
    const updatedList = replacementList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setReplacementList(updatedList);
    saveDataToStorage(prayerStatus, fastStreak, isFastedToday, sahoorDone, updatedList, terawihCount, diary);
  };

  const scrollToSection = (id: string) => {
    setShowSidebar(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
    saveDataToStorage(prayerStatus, newStreak, isFastedToday, sahoorDone, replacementList, terawihCount, diary);
  };

  const devNewDay = () => {
    const newStreak = fastStreak; // Keep streak
    setIsFastedToday(false);
    setSahoorDone(false);
    setPrayerStatus({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
    saveDataToStorage({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }, newStreak, false, false, replacementList, 0, "");
    alert("Simulated New Day! (Streak preserved, checked items reset)");
  };

  const prayersList = [
    { key: 'fajr', name: 'Subuh', emoji: '🌄' },
    { key: 'dhuhr', name: 'Zohor', emoji: '☀️' },
    { key: 'asr', name: 'Asar', emoji: '🌤' },
    { key: 'maghrib', name: 'Maghrib', emoji: '🌇' },
    { key: 'isha', name: 'Isyak', emoji: '🌙' },
  ];

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
    <div className="app animate-enter">
      {/* Topbar */}
      <div className="topbar" style={{ paddingBottom: '16px' }}>
        <div className="topbar-brand">
          <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '24px', marginRight: '10px', cursor: 'pointer' }}>☰</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              <span className="brand-name">Ramadan</span>
              <span className="brand-year">1447 AH</span>
            </div>
          </div>
        </div>
      </div>

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
      {currentViewDate !== new Date().toLocaleDateString() && (
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

      {/* Next Prayer Countdown Widget */}
      {nextPrayer && (
        <div className="next-prayer-widget animate-enter delay-100">
          <div className="next-prayer-label">Seterusnya</div>
          <div className="next-prayer-name">{nextPrayer}</div>
          <div className="next-prayer-time">{timeToNextPrayer}</div>
        </div>
      )}
      {/* Daily Prayer Times */}
      <div id="solat"></div>
      <div className="section-title">Waktu Solat</div>

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
              {(() => {
                const recordDate = currentViewDate || new Date().toLocaleDateString();
                const missedFastRecord = replacementList.find(r => r.date === recordDate);

                if (isFastedToday) {
                  return <span className="fast-action-btn" style={{ border: 'none', background: 'transparent', color: 'var(--gold)' }}>Direkod</span>;
                } else if (missedFastRecord) {
                  return <span className="fast-action-btn" style={{ border: 'none', background: 'transparent', color: 'var(--red)' }}>Tidak Puasa ({missedFastRecord.reason})</span>;
                } else {
                  return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="fast-action-btn confirm" onClick={handleFastToday}>✓ Puasa</button>
                      <button className="fast-action-btn" onClick={handleMissedFast} style={{ background: 'var(--red)', color: 'white', opacity: 0.8 }}>× Tak</button>
                    </div>
                  );
                }
              })()}
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
          <button onClick={() => setShowLocationModal(true)} disabled={loadingPrayer} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', opacity: loadingPrayer ? 0.7 : 1 }}>
            {loadingPrayer ? '🛰️ Mencari...' : `📍 ${userZone}`}
          </button>
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
      {/* TERAWIH TRACKER */}
      <div id="terawih" className="card animate-enter delay-200" style={{ marginTop: '20px', padding: '20px' }}>
        <div className="section-label" style={{ marginBottom: '16px' }}>Solat Terawih 🕌</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--surface2)', borderRadius: '16px', padding: '8px' }}>
          {/* 8 Rakaat */}
          <button
            onClick={() => handleTerawih(8)}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              background: terawihCount === 8 ? 'var(--gold)' : 'transparent',
              color: terawihCount === 8 ? 'var(--surface)' : 'var(--text-muted)',
              fontWeight: 'bold', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
            }}
          >
            <span style={{ fontSize: '16px' }}>8</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>Rakaat</span>
          </button>

          {/* 20 Rakaat */}
          <button
            onClick={() => handleTerawih(20)}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              background: terawihCount === 20 ? 'var(--gold)' : 'transparent',
              color: terawihCount === 20 ? 'var(--surface)' : 'var(--text-muted)',
              fontWeight: 'bold', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
            }}
          >
            <span style={{ fontSize: '16px' }}>20</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>Rakaat</span>
          </button>

          {/* Lain-lain */}
          <button
            onClick={() => setIsCustomTerawih(true)}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              background: (typeof terawihCount === 'string' && terawihCount !== "Tak Buat") || isCustomTerawih ? 'var(--gold)' : 'transparent',
              color: (typeof terawihCount === 'string' && terawihCount !== "Tak Buat") || isCustomTerawih ? 'var(--surface)' : 'var(--text-muted)',
              fontWeight: 'bold', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
            }}
          >
            <span style={{ fontSize: '16px' }}>✏️</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>Lain-lain</span>
          </button>

          {/* Tak Buat */}
          <button
            onClick={() => handleTerawih("Tak Buat")}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              background: terawihCount === "Tak Buat" ? 'var(--red)' : 'transparent',
              color: terawihCount === "Tak Buat" ? 'white' : 'var(--text-muted)',
              fontWeight: 'bold', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
            }}
          >
            <span style={{ fontSize: '16px' }}>🚫</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>Tak Buat</span>
          </button>
        </div>

        {/* Custom Input Field */}
        {isCustomTerawih && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', animation: 'fadeIn 0.3s' }}>
            <input
              type="text"
              placeholder="Contoh: 12 rakaat / Di rumah"
              value={customTerawih}
              onChange={(e) => setCustomTerawih(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
            />
            <button onClick={handleCustomTerawihSave} style={{ padding: '0 16px', borderRadius: '8px', background: 'var(--gold)', color: 'var(--surface)', border: 'none', fontWeight: 'bold' }}>OK</button>
          </div>
        )}

        {/* Feedback Message */}
        {terawihCount !== 0 && !isCustomTerawih && (
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--gold)', animation: 'fadeIn 0.3s' }}>
            {terawihCount === "Tak Buat" ? "Tak apa, cuba lagi esok! 💪" : typeof terawihCount === 'string' ? `Rekod: ${terawihCount}` : "✨ Alhamdulillah! Semoga diterima amal."}
          </div>
        )}
      </div>

      <div id="diari" className="card animate-enter delay-200" style={{ marginTop: '20px', padding: '20px' }}>
        <div className="section-label" style={{ marginBottom: '15px' }}>📔 Diari Ramadan</div>
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
      </div>

      {/* GANTI PUASA LIST */}
      {replacementList.length > 0 && (
        <div className="card animate-enter delay-300" style={{ marginTop: '20px', padding: '20px' }}>
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
              <button onClick={() => confirmMissedFast("Uzur")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>🩸 Uzur</button>
              <button onClick={() => confirmMissedFast("Terbatal")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>❌ Terbatal</button>
              <button onClick={() => confirmMissedFast("Lain-lain")} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface2)', border: 'none', color: 'var(--text)', textAlign: 'left' }}>📝 Lain-lain</button>
            </div>
            <button onClick={() => setShowReasonModal(false)} style={{ marginTop: '16px', padding: '10px', width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
        v2.0 <span onClick={() => setShowAdminLogin(true)} style={{ cursor: 'pointer', opacity: 0.3 }}>🔒</span>
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
      {/* SIDEBAR NAVIGATION */}
      {showSidebar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          animation: 'fadeIn 0.2s'
        }} onClick={() => setShowSidebar(false)}>
          <div style={{
            width: '280px', height: '100%', background: 'var(--surface)',
            boxShadow: 'var(--shadow)', padding: '20px',
            display: 'flex', flexDirection: 'column',
            animation: 'slideRight 0.3s' // Need to define slideRight or rely on default
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
            </div>

            <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Ramadan Streak v1.7 <br />
              Made with ❤️
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
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
      )}

      {/* LOCATION MODAL */}
      {showLocationModal && (
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
      )}
    </div>
  );
}