"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HeroSection from "./components/HeroSection";
import PrayerTimesWidget from "./components/PrayerTimesWidget";
import DailyChecklist from "./components/DailyChecklist";
import TerawihTracker from "./components/TerawihTracker";
import RamadanDiary from "./components/RamadanDiary";
import MissedFastList from "./components/MissedFastList";
import Sidebar from "./components/Sidebar";
import AdminModal from "./components/Modals/AdminModal";
import ReasonModal from "./components/Modals/ReasonModal";
import LocationModal from "./components/Modals/LocationModal";
import { ReplacementDay } from "./types";

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

    // Pre-unlock Audio for Azan Autoplay
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (!w._audioUnlocked) {
        w._audioS = new Audio('/azanS.mp3');
        w._audioB = new Audio('/azanB.mp3');

        const unlock = () => {
          if (!w._audioUnlocked) {
            w._audioUnlocked = true;
            w._audioS?.load();
            w._audioB?.load();
            // Silent play-pause to satisfy browser requirement
            w._audioS?.play().then(() => w._audioS?.pause()).catch(() => { });
            w._audioB?.play().then(() => w._audioB?.pause()).catch(() => { });

            if ('Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission();
            }

            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
          }
        };

        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
      }
    }
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
  const [replacementList, setReplacementList] = useState<ReplacementDay[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [missedReason, setMissedReason] = useState<string>("");

  // Terawih State
  const [terawihCount, setTerawihCount] = useState<number | string>(0);
  const [customTerawih, setCustomTerawih] = useState<string>("");
  const [isCustomTerawih, setIsCustomTerawih] = useState(false);

  // Diary State
  const [diary, setDiary] = useState<string>("");
  const [showSubmitToast, setShowSubmitToast] = useState(false);

  // Sidebar & Report State
  const [showSidebar, setShowSidebar] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [history, setHistory] = useState<Record<string, any>>({});

  // Admin / Dev Tools State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [devOffsetDays, setDevOffsetDays] = useState(0);

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
    // Load dev offset
    try {
      if (typeof window !== 'undefined') {
        const offset = localStorage.getItem('ramadan_dev_offset');
        if (offset) setDevOffsetDays(parseInt(offset, 10));
      }
    } catch (e) { }

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
    today.setDate(today.getDate() + devOffsetDays);
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

  }, [currentViewDate, devOffsetDays]);

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

      // Play Azan when time exactly hits 0
      if (hours === 0 && minutes === 0 && seconds === 0) {
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`Waktu ${upcoming.name}`, {
              body: `Telah masuk waktu solat fardu ${upcoming.name}.`
            });
          } catch (e) { }
        }

        try {
          const isSubuh = upcoming.name.toLowerCase().includes('subuh');
          if (typeof window !== 'undefined') {
            const w = window as any;
            const audioToPlay = isSubuh ? w._audioS : w._audioB;
            if (audioToPlay) {
              audioToPlay.currentTime = 0;
              audioToPlay.play().catch((e: any) => console.log("Audio play prevented by browser:", e));
            } else {
              // Fallback if not unlocked
              const audio = new Audio(isSubuh ? '/azanS.mp3' : '/azanB.mp3');
              audio.play().catch((e: any) => console.log("Audio play prevented by browser:", e));
            }
          }
        } catch (e) { }
      }

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

    // Increment offset to unlock calendar
    const newOffset = devOffsetDays + 1;
    setDevOffsetDays(newOffset);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ramadan_dev_offset', newOffset.toString());
    }

    alert("Simulated New Day! (Streak preserved, checked items reset, Calendar Unlocked)");
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
    <>
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

        <HeroSection
          calendarDays={calendarDays}
          currentViewDate={currentViewDate}
          setCurrentViewDate={setCurrentViewDate}
          fastStreak={fastStreak}
        />

        <PrayerTimesWidget
          nextPrayer={nextPrayer}
          timeToNextPrayer={timeToNextPrayer}
          prayerTimes={prayerTimes}
        />

        <DailyChecklist
          isFastedToday={isFastedToday}
          handleFastToday={handleFastToday}
          handleMissedFast={handleMissedFast}
          sahoorDone={sahoorDone}
          handleSahoorToggle={handleSahoorToggle}
          prayerStatus={prayerStatus}
          togglePrayer={togglePrayer}
        />

        {/* BAHAGIAN WAKTU SOLAT (LOCATION TRIGGER) */}
        <div className="section-label flex justify-between items-center" style={{ marginTop: '20px' }}>
          <span>Lokasi Terkini</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setShowLocationModal(true)} disabled={loadingPrayer} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '14px', opacity: loadingPrayer ? 0.7 : 1 }}>
              {loadingPrayer ? '🛰️ Mencari...' : `📍 ${userZone}`}
            </button>
          </div>
        </div>

        <TerawihTracker
          terawihCount={terawihCount}
          handleTerawih={handleTerawih}
          isCustomTerawih={isCustomTerawih}
          setIsCustomTerawih={setIsCustomTerawih}
          customTerawih={customTerawih}
          setCustomTerawih={setCustomTerawih}
          handleCustomTerawihSave={handleCustomTerawihSave}
        />

        <RamadanDiary
          diary={diary}
          handleDiaryChange={handleDiaryChange}
          showSubmitToast={showSubmitToast}
          setShowSubmitToast={setShowSubmitToast}
        />

        <MissedFastList
          replacementList={replacementList}
          toggleReplacement={toggleReplacement}
        />

        <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          v5.5 (Refactored) <span onClick={() => setShowAdminLogin(true)} style={{ cursor: 'pointer', opacity: 0.3 }}>🔒</span>
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

        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          scrollToSection={scrollToSection}
        />

        <AdminModal
          showAdminLogin={showAdminLogin}
          setShowAdminLogin={setShowAdminLogin}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          handleAdminLogin={handleAdminLogin}
        />

        <LocationModal
          showLocationModal={showLocationModal}
          setShowLocationModal={setShowLocationModal}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          userZone={userZone}
          handleZoneChange={handleZoneChange}
          ZONES={ZONES}
        />
      </div>

      <ReasonModal
        showReasonModal={showReasonModal}
        setShowReasonModal={setShowReasonModal}
        confirmMissedFast={confirmMissedFast}
      />
    </>
  );
}