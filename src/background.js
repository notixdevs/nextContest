chrome.runtime.onInstalled.addListener(async () => {
    await setupAlarm();
    await fetchAndCacheContests();
});

chrome.runtime.onStartup.addListener(async () => {
    console.log("Extension started (e.g. browser restart)");
    await fetchAndCacheContests();
});

async function setupAlarm() {
    await chrome.alarms.clearAll();
    await chrome.alarms.create("contestFetch", {
        periodInMinutes: 45  
    });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "contestFetch") {
        await fetchAndCacheContests();
    }
});

export async function fetchAndCacheContests(retryCount = 0) {
    try {
        const response = await fetch("http://localhost:3000/api/contests", { // Fixed: add 'http://'
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contests = await response.json();

        const currentData = await chrome.storage.local.get(['contests']);

        if (JSON.stringify(currentData.contests) !== JSON.stringify(contests)) {
            await chrome.storage.local.set({
                contests,
                lastFetched: Date.now()
            });
        }

    } catch (error) {
        console.error("Fetch error:", error);

        if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);

            return new Promise((resolve) => {
                setTimeout(async () => {
                    resolve(await fetchAndCacheContests(retryCount + 1));
                }, delay);
            });
        } else {
            console.error("Max retries reached");
        }
    }
}
