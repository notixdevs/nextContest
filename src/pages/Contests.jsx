import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ContestCard from "../Components/ContestCard";

import PlatformData from "../data/PlatformsData";
import { fetchAndCacheContests } from "../background";
import { calculateDuration, isContestLive } from "../customHooks";

const Contests = () => {
    const [pinnedContests, setPinnedContests] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [displayWebsites, setDisplayWebsites] = useState([]);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const navigate = useNavigate();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const getLocalStorage = (keys) =>
        new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(result);
            });
        });

    const setLocalStorage = (items) =>
        new Promise((resolve, reject) => {
            chrome.storage.local.set(items, () => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve();
            });
        });

    useEffect(() => {
        getLocalStorage(["selectedPlatforms", "pinnedContests"])
            .then((result) => {
                const storedPlatforms = result.selectedPlatforms;
                const storedPinned = result.pinnedContests;

                if (!storedPlatforms || storedPlatforms.length === 0) {
                    navigate("/select-platforms");
                } else {
                    setPlatforms(storedPlatforms);
                }

                if (storedPinned) {
                    setPinnedContests(storedPinned);
                }
            })
            .catch((err) => {
                console.error("Failed to load local storage:", err);
                setError("Failed to load your settings.");
                setLoading(false);
            });
    }, [navigate]);

    useEffect(() => {
        const allowedWebsites = PlatformData.map((platform) => platform.url);

        const newDisplayWebsites =
            platforms.length > 0
                ? allowedWebsites.filter((website) =>
                      platforms.some((platform) =>
                          website.toLowerCase().includes(platform.toLowerCase())
                      )
                  )
                : allowedWebsites;

        setDisplayWebsites(newDisplayWebsites);
    }, [platforms]);

    useEffect(() => {
        const fetchAndUpdateContests = async () => {
            try {
                const result = await getLocalStorage([
                    "contests",
                    "lastFetched",
                ]);
                if (result.contests && result.contests.length > 0) {
                    setContests(result.contests);
                } else {
                    await fetchAndCacheContests();
                    const newResult = await getLocalStorage(["contests"]);
                    if (newResult.contests && newResult.contests.length > 0) {
                        setContests(newResult.contests);
                    } else {
                        setError("Internal Error, Please Try Again Later.");
                    }
                }
            } catch (err) {
                console.error("Error fetching contests:", err);
                setError(err.message || "Unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndUpdateContests();

        const intervalId = setInterval(() => {
            fetchAndUpdateContests();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const combinedContests = useMemo(() => {
        const activeContests = contests.filter((contest) => {
            const isWebsiteMatch = displayWebsites.some(
                (website) =>
                    contest.resource.toLowerCase() === website.toLowerCase()
            );
            const isActive =
                isContestLive(contest.start, contest.end) !== "ENDED";
            return isWebsiteMatch && isActive;
        });

        return [
            ...pinnedContests,
            ...activeContests.filter(
                (contest) =>
                    !pinnedContests.some((pinned) => pinned.id === contest.id)
            ),
        ];
    }, [contests, displayWebsites, pinnedContests]);

    const handlePinClick = (contest) => {
        setPinnedContests((prevPinned) => {
            const isPinned = prevPinned.some(
                (pinned) => pinned.id === contest.id
            );

            const updatedPinned = isPinned
                ? prevPinned.filter((pinned) => pinned.id !== contest.id)
                : [...prevPinned, contest];

            const sortedPinnedContests = [...updatedPinned].sort(
                (a, b) => new Date(a.start) - new Date(b.start)
            );

            setLocalStorage({ pinnedContests: sortedPinnedContests }).catch(
                (err) => console.error("Failed to save pinned contests:", err)
            );

            return sortedPinnedContests;
        });
    };

    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setShowLoader(true), 200);
        } else {
            setShowLoader(false);
        }

        return () => clearTimeout(timer);
    }, [loading]);

    const handleSettingsClick = () => {
        navigate("/select-platforms");
    };

    return (
        <div className="flex flex-col bg-gray-100 h-[600px] w-[400px] overflow-hidden rounded-lg">
            <Header onSettingsClick={handleSettingsClick} />

            {/* Scrollable Contest List */}
            <div className="flex-1 overflow-auto p-4 pt-0">
                {showLoader ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-[14px] text-red-500 p-4">
                        {error}
                    </div>
                ) : platforms.length > 0 ? (
                    <div className="mt-4">
                        {combinedContests.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {combinedContests.map((contest, index) => {
                                    const isPinned = pinnedContests.some(
                                        (pinned) => pinned.id === contest.id
                                    );
                                    const logoSrc = PlatformData.find(
                                        (platformInfo) =>
                                            platformInfo.url ===
                                            contest.resource.toLowerCase()
                                    )?.image;
                                    const contestStatus = isContestLive(
                                        contest.start,
                                        contest.end
                                    );
                                    const duration = calculateDuration(
                                        contest.duration
                                    );

                                    return (
                                        <ContestCard
                                            key={index}
                                            contest={contest}
                                            logoSrc={logoSrc}
                                            isPinned={isPinned}
                                            onPinClick={handlePinClick}
                                            contestStatus={contestStatus}
                                            duration={duration}
                                            userTimeZone={userTimeZone}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600">
                                No contests available for selected platforms.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">
                        No platforms selected.
                    </p>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Contests;
