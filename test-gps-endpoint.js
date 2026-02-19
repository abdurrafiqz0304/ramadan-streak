
// using built-in fetch
async function testGPS() {
    const lat = 3.1412; // KL
    const long = 101.6865;
    console.log(`Testing GPS: ${lat}, ${long}`);

    try {
        const apiUrl = `https://api.waktusolat.app/v2/solat/gps/${lat}/${long}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        console.log('Status:', res.status);
        if (data.zone) {
            console.log("Zone detected:", data.zone);
        }

        if (data.prayers && data.prayers.length > 0) {
            console.log("Prayer times found (sample):", JSON.stringify(data.prayers[0], null, 2));
        } else {
            console.log("No prayer times found or different structure:", Object.keys(data));
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testGPS();
