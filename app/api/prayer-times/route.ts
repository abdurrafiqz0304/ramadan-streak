import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const long = searchParams.get('long');
  let zone = searchParams.get('zone') || 'PHG03'; // Default to Jerantut (PHG03)

  try {
    let apiUrl;

    if (lat && long) {
      // Use GPS endpoint
      apiUrl = `https://api.waktusolat.app/v2/solat/gps/${lat}/${long}`;
    } else {
      // Use Zone endpoint
      // Gunakan API Waktu Solat App (Official JAKIM mirror) V2
      // URL: https://api.waktusolat.app/v2/solat/{zone}
      apiUrl = `https://api.waktusolat.app/v2/solat/${zone}`;
    }

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'RamadanStreakApp/1.0'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data from API: ${res.status}`);
    }

    const data = await res.json();

    // V2 returns data for the whole month/year.
    // data.prayers is an array of objects.
    // Each object has a "day" field (day of month, 1-31).
    // We need to find the entry for today.

    // Get today's day of month in Malaysia timezone to be safe
    const now = new Date();
    const malaysiaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const currentDay = malaysiaTime.getDate();

    const todayPrayer = data.prayers.find((p: any) => p.day === currentDay);

    if (!todayPrayer) {
      throw new Error('Prayer time for today not found');
    }

    // Helper to convert unix timestamp (seconds) to HH:mm string
    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    // Construct the response object matching the frontend expectation
    // Frontend expects: { prayerTime: [ { fajr: "HH:mm", ... } ] }
    const formattedPrayer = {
      fajr: formatTime(todayPrayer.fajr),
      syuruk: formatTime(todayPrayer.syuruk),
      dhuhr: formatTime(todayPrayer.dhuhr),
      asr: formatTime(todayPrayer.asr),
      maghrib: formatTime(todayPrayer.maghrib),
      isha: formatTime(todayPrayer.isha),
      date: malaysiaTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) // e.g., "19 Feb 2026"
    };

    return NextResponse.json({
      prayerTime: [formattedPrayer],
      status: 'OK',
      zone: data.zone || zone // Return API detected zone or requested zone
    });

  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer times' }, { status: 500 });
  }
}
