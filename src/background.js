import { isContestLive } from "./customHooks";

let alarmListenerRegistered = false;
let reminderWindows = {}; // contestId -> windowId

chrome.runtime.onInstalled.addListener(async () => {
    await setupAlarm();
    await fetchAndCacheContests();
    await setupReminderAlarm();
});

chrome.runtime.onStartup.addListener(async () => {
    console.log("Extension started (e.g. browser restart)");
    await fetchAndCacheContests();
});

async function setupAlarm() {
    await chrome.alarms.clearAll();
    await chrome.alarms.create("contestFetch", {
        periodInMinutes: 45,
    });
}

async function setupReminderAlarm() {
    await chrome.alarms.create("remindContest", {
        periodInMinutes: 1,
    });
}

const pinnedContestCheck = async () => {
    try {
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(["pinnedContests"], resolve);
        });

        const pinnedContests = result.pinnedContests || [];

        if (!Array.isArray(pinnedContests) || pinnedContests.length === 0) {
            return null;
        }

        const contestsStartingSoon = pinnedContests.filter((contest) => {
            return isContestLive(contest.start, contest.end, true) === "REMIND";
        });

        return contestsStartingSoon[0] || null;
    } catch (error) {
        console.error("Error checking pinned contests:", error);
        return null;
    }
};

// 🛡️ Prevent double listener registration
if (!alarmListenerRegistered) {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === "contestFetch") {
            await fetchAndCacheContests();
        }

        if (alarm.name === "remindContest") {
            console.log("Reminder alarm triggered");

            const contest = await pinnedContestCheck();
            if (!contest) return;

            const contestId = contest.id;
            const { shownPopups = [] } = await chrome.storage.local.get("shownPopups");

            // 🛑 Skip if already shown or being shown
            if (shownPopups.includes(contestId)) return;

            try {
                if (reminderWindows[contestId]) {
                    const windowInfo = await chrome.windows.get(reminderWindows[contestId]);
                    if (windowInfo) {
                        chrome.windows.update(reminderWindows[contestId], { focused: true });
                        return;
                    }
                }
            } catch {
                delete reminderWindows[contestId]; // window not found
            }

            // ✅ Create popup
            chrome.windows.create(
                {
                    url: chrome.runtime.getURL(`reminder.html?contestId=${contestId}`),
                    type: "popup",
                    width: 500,
                    height: 250,
                },
                async (window) => {
                    if (window) {
                        reminderWindows[contestId] = window.id;

                        const updatedPopups = [...shownPopups, contestId];
                        await chrome.storage.local.set({ shownPopups: updatedPopups });

                        chrome.windows.onRemoved.addListener(function handleClose(windowId) {
                            if (windowId === reminderWindows[contestId]) {
                                delete reminderWindows[contestId];
                                chrome.windows.onRemoved.removeListener(handleClose);
                            }
                        });
                    }
                }
            );
        }
    });

    alarmListenerRegistered = true;
}

export async function fetchAndCacheContests(retryCount = 0) {
    try {
        const response = await fetch("http://localhost:3000/api/contests", {
            method: "GET",
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contests = await response.json();
        const currentData = await chrome.storage.local.get(["contests"]);

        if (JSON.stringify(currentData.contests) !== JSON.stringify(contests)) {
            await chrome.storage.local.set({
                contests,
                lastFetched: Date.now(),
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
