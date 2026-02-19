
// using built-in fetch
async function testSpeed() {
    const lat = 3.1412;
    const long = 101.6865;
    console.log(`Starting request...`);
    const start = Date.now();

    try {
        const apiUrl = `https://api.waktusolat.app/v2/solat/gps/${lat}/${long}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        const end = Date.now();
        console.log(`Time taken: ${(end - start)}ms`);
        console.log(`Status: ${res.status}`);

    } catch (e) {
        console.error('Error:', e.message);
        console.log(`Time taken (failed): ${(Date.now() - start)}ms`);
    }
}

testSpeed();
