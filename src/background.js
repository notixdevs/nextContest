
chrome.runtime.onInstalled.addListener(async () => {
    // console.log("Extension installed or updated");
    await setupAlarm();
    await fetchAndCacheContests();
});

async function setupAlarm() {
    await chrome.alarms.clearAll();
    
    
    await chrome.alarms.create("contestFetch", {
        periodInMinutes: 45  
    });
    
    // console.log("Contest fetch alarm created/updated");
}


chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "contestFetch") {
        // console.log(`Alarm triggered at: ${new Date().toISOString()}`);
        await fetchAndCacheContests();
    }
});

export async function fetchAndCacheContests(retryCount = 0) {
    try {
        // const timestamp = new Date().toISOString();
        // console.log(`Starting fetch at: ${timestamp}`);
        
        const response = await fetch("https://cp-extension-backend.onrender.com/api/contests", {
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
        // console.log("Contests fetched:", contests);
        
        const currentData = await chrome.storage.local.get(['contests']);
        
        if (JSON.stringify(currentData.contests) !== JSON.stringify(contests)) {
            await chrome.storage.local.set({
                contests,
                lastFetched: Date.now()
            });
            // console.log("New contest data cached");
        } else {
            // console.log("No changes in contest data");
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

// For debugging: 
// chrome.storage.onChanged.addListener((changes, namespace) => {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed:`,
//             `Old value:`, oldValue,
//             `New value:`, newValue
//         );
//     }
// });
