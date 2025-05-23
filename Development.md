For Development:

Replace this in Background.js

```js
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
```

Replace thisn in platform.jsx

```js
const DEFAULT_PLATFORMS = [
    "codeforces.com",
    "codechef.com",
    "leetcode.com",
    "atcoder.jp",
    "naukri.com/code360",
    "geeksforgeeks.org",
];

useEffect(() => {
    chrome.storage.local.get(["selectedPlatforms"], (result) => {
        const stored = result.selectedPlatforms;

        if (Array.isArray(stored) && stored.length > 0) {
            setSelectedPlatforms(stored);
        } else {
            setSelectedPlatforms([DEFAULT_PLATFORMS]);
            chrome.storage.local.set({
                selectedPlatforms: [DEFAULT_PLATFORMS],
            });
        }
    });
}, []);
```

Replace this in Contest.jsx

````js
    useEffect(() => {
        const fetchAndCleanUpContests = async () => {
            try {
                chrome.storage.local.get(
                    ["contests", "lastFetched"],
                    async (result) => {
                        if (chrome.runtime.lastError) {
                            setError(
                                "Failed to fetch contests from local storage."
                            );
                            console.error(chrome.runtime.lastError);
                            setLoading(false);
                        } else if (
                            result.contests &&
                            result.contests.length > 0
                        ) {
                            // Use cached data
                            setContests(result.contests);
                            setLoading(false);
                        } else {
                            // Fetch new data and cache it
                            try {
                                await fetchAndCacheContests();
                                chrome.storage.local.get(
                                    ["contests"],
                                    (newResult) => {
                                        if (
                                            newResult.contests &&
                                            newResult.contests.length > 0
                                        ) {
                                            setContests(newResult.contests);
                                            setLoading(false);
                                        } else {
                                            setError(
                                                "Internal Error, Please Try Again Later."
                                            );
                                            setLoading(false);
                                        }
                                    }
                                );
                            } catch (error) {
                                setError(
                                    error.message || "Failed to fetch contests."
                                );
                                setLoading(false);
                            }
                        }
                    }
                );

                setPinnedContests((prevPinned) => {
                    const updatedPinned = prevPinned.filter(
                        (contest) =>
                            isContestLive(contest.start, contest.end) !==
                            "ENDED"
                    );
                    chrome.storage.local.set({
                        pinnedContests: updatedPinned,
                    });
                    return updatedPinned;
                });
            } catch (error) {
                console.error(
                    "Error fetching contests from local storage:",
                    error
                );
                setError(error.message || "Unexpected error occurred.");
                setLoading(false);
            }
        };

        fetchAndCleanUpContests();

        const intervalId = setInterval(() => {
            fetchAndCleanUpContests();
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);
    ```

````

In background.js and customHooks.

```js
async function setupReminderAlarm() {
    await chrome.alarms.create("remindContest", {
        periodInMinutes: 0.2,
    });
}

const fiveMinutesInMilliseconds = 10 * 60 * 1000;
```
