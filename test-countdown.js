
// using built-in fetch
async function testCountdown() {
    try {
        // 1. Fetch data like the frontend does
        const res = await fetch('http://localhost:3000/api/prayer-times?zone=PHG03');
        const json = await res.json();
        const waktuHariIni = json.prayerTime[0];

        // 2. Simulate Frontend State Processing
        const prayerTimes = {
            fajr: waktuHariIni.fajr.substring(0, 5),
            dhuhr: waktuHariIni.dhuhr.substring(0, 5),
            asr: waktuHariIni.asr.substring(0, 5),
            maghrib: waktuHariIni.maghrib.substring(0, 5),
            isha: waktuHariIni.isha.substring(0, 5),
        };

        console.log('Processed Prayer Times:', prayerTimes);

        // 3. Simulate Countdown Logic
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

        if (!upcoming) {
            upcoming = { key: 'fajr', name: 'Subuh Esok', time: times[0].time };
        }

        console.log('Current Time:', now.toLocaleTimeString());
        console.log('Next Prayer Detected:', upcoming.name, '@', upcoming.time);

        // Calculate diff
        const [h, m] = upcoming.time.split(':').map(Number);
        let targetTime = new Date();
        targetTime.setHours(h, m, 0, 0);

        if (targetTime < now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        const diff = targetTime.getTime() - now.getTime();
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        console.log(`Countdown: ${hours}h ${minutes}m (approx)`);

    } catch (error) {
        console.error('Error:', error);
    }
}

testCountdown();
