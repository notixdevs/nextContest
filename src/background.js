import { isContestLive } from "./customHooks";

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
        periodInMinutes: 0.2, // Check every minute for better accuracy
    });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "contestFetch") {
        await fetchAndCacheContests();
    }
});

// // Helper function to check if a contest starts in the next 5 minutes
// const isContestStartingSoon = (startTime) => {
//     const now = new Date();
//     const contestStart = new Date(startTime);
//     const timeDiff = contestStart.getTime() - now.getTime();
//     const minutesDiff = timeDiff / (1000 * 60);
//     console.log(minutesDiff);

//     // Contest starts in the next 5 minutes (and hasn't started yet)
//     return minutesDiff > 0 && minutesDiff <= 5;
// };

// Check pinned contests for upcoming ones starting in 5 minutes
const pinnedContestCheck = async () => {
    try {
        const result = await new Promise((resolve) => {
            chrome.storage.local.get(["pinnedContests"], resolve);
        });

        const pinnedContests = result.pinnedContests || [];

        // console.log(pinnedContests);

        if (!Array.isArray(pinnedContests) || pinnedContests.length === 0) {
            // console.log("No pinned contests found");
            return null;
        }

        const contestsStartingSoon = pinnedContests.filter((contest) => {
            return isContestLive(contest.start, contest.end, true) === "REMIND";
        });
        

        if (contestsStartingSoon.length === 0) return null;

        return contestsStartingSoon[0];
    } catch (error) {
        console.error("Error checking pinned contests:", error);
        return null;
    }
};



let reminderWindows = {}; // contestId -> windowId

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "remindContest") {
        console.log("Reminder alarm triggered");
        const contest = await pinnedContestCheck();

        if (!contest) {
            // console.log("No contest starting soon");
            return;
        }

        const contestId = contest.id;
        // console.log("Contest starting soon - ID:", contestId);

        // Check if this contestId has already had a popup shown
        const { shownPopups = [] } = await chrome.storage.local.get(
            "shownPopups"
        );

        if (shownPopups.includes(contestId)) {
            // console.log("Popup already shown for contest ID:", contestId);
            return;
        }

        // If a window for this contestId is already open, focus it
        if (reminderWindows[contestId] !== undefined) {
            try {
                const windowInfo = await chrome.windows.get(
                    reminderWindows[contestId]
                );
                if (windowInfo) {
                    chrome.windows.update(reminderWindows[contestId], {
                        focused: true,
                    });
                    return;
                }
            } catch (error) {
                // Window doesn't exist anymore
                delete reminderWindows[contestId];
            }
        }

        // Create new popup window with contestId as URL parameter
        chrome.windows.create(
            {
                url: chrome.runtime.getURL(
                    `reminder.html?contestId=${contestId}`
                ),
                type: "popup",
                width: 500,
                height: 250,
            },
            async (window) => {
                if (window) {
                    reminderWindows[contestId] = window.id;

                    // Mark this contest as having shown a popup (permanent - won't show again)
                    const updatedPopups = [...shownPopups, contestId];
                    await chrome.storage.local.set({
                        shownPopups: updatedPopups,
                    });

                    // console.log("Popup created for contest ID:", contestId);

                    // Clean up the window ID when it's closed
                    chrome.windows.onRemoved.addListener(function handleClose(
                        windowId
                    ) {
                        if (windowId === reminderWindows[contestId]) {
                            delete reminderWindows[contestId];
                            chrome.windows.onRemoved.removeListener(
                                handleClose
                            );
                        }
                    });
                }
            }
        );
    }
});

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
            console.log(
                `Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`
            );

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
