import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ContestCard from "../Components/ContestCard";

import PlatformData from "../data/PlatformsData";
import { fetchAndCacheContests } from "../background";

const SelectedPlatformsPage = () => {
    const [platforms, setPlatforms] = useState([]);
    const [displayWebsites, setDisplayWebsites] = useState([]);
    const [pinnedContests, setPinnedContests] = useState([]);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const navigate = useNavigate();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        const storedPlatforms = localStorage.getItem("selectedPlatforms");
        if (!storedPlatforms || JSON.parse(storedPlatforms).length === 0) {
            navigate("/select-platforms");
        } else {
            setPlatforms(JSON.parse(storedPlatforms));
        }

        const storedPinnedContests = localStorage.getItem("pinnedContests");
        if (storedPinnedContests) {
            setPinnedContests(JSON.parse(storedPinnedContests));
        }
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
        const fetchLatestContests = async () => {
            try {
                await fetchAndCacheContests(); // This fetches fresh data from your backend and saves it to chrome.storage
                chrome.storage.local.get(['contests'], (result) => {
                    if (chrome.runtime.lastError) {
                        setError("Failed to fetch contests from local storage.");
                        console.error(chrome.runtime.lastError);
                    } else if (result.contests && result.contests.length > 0) {
                        setContests(result.contests);
                
                        setPinnedContests((prevPinned) => {
                            const updatedPinned = prevPinned
                                .map((pinned) => {
                                    const fresh = result.contests.find((c) => c.id === pinned.id);
                                    return fresh ? fresh : pinned;
                                })
                                .filter(
                                    (contest) => isContestLive(contest.start, contest.end) !== "ENDED"
                                );
                
                            localStorage.setItem("pinnedContests", JSON.stringify(updatedPinned));
                            return updatedPinned;
                        });
                
                    } else {
                        setError("No contests found.");
                    }
                    setLoading(false);
                });
                
                
    
            } catch (error) {
                console.error("Error fetching contests:", error);
                setError(error.message || "Unexpected error occurred.");
                setLoading(false);
            }
        };
    
        fetchLatestContests();
    
        // Optional: refetch every X seconds (disable during dev if annoying)
        const intervalId = setInterval(() => {
            fetchLatestContests();
        }, 10000); // 10 seconds
    
        return () => clearInterval(intervalId);
    }, []);
    

    const isContestLive = (start, end) => {
        const now = new Date();

        // Get local timezone offset in milliseconds
        const localOffset = now.getTimezoneOffset() * 60 * 1000;
        const offsetMs = -localOffset;

        // Parse start and end times and add the timezone offset
        const startDate = new Date(new Date(start).getTime() + offsetMs);
        const endDate = new Date(new Date(end).getTime() + offsetMs);

        if (now >= endDate) return "ENDED";

        if (startDate <= now && now <= endDate) {
            return "LIVE";
        }

        const diffInMilliseconds = startDate - now;
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        
        const diffInDays = Math.ceil(diffInMilliseconds / oneDayInMilliseconds);
        const remainingMilliseconds = diffInMilliseconds % oneDayInMilliseconds;
        const diffInHours = Math.ceil(remainingMilliseconds / (1000 * 60 * 60));
        
        const formattedDays = String(diffInDays).padStart(2, '0');
        const formattedHours = String(diffInHours).padStart(2, '0');
        if (diffInMilliseconds >= 0 && diffInMilliseconds < oneDayInMilliseconds) {
            return `${formattedHours} hours`;
        } else if (diffInDays >= 1 && diffInDays <= 8) {
            return `${formattedDays} days`;
        }
        
        
        return "Upcoming";
    };

    const combinedContests = useMemo(() => {
        const activeContests = contests.filter((contest) => {
            const isWebsiteMatch = displayWebsites.some(
                (website) =>
                    contest.resource.toLowerCase() === website.toLowerCase()
            );
            const isActive = isContestLive(contest.start, contest.end) !== "ENDED";
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
    

    const calculateDuration = (duration) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

const handlePinClick = (contest) => {
        setPinnedContests((prevPinned) => {
            const newPinnedContests = prevPinned.some(
                (pinned) => pinned.id === contest.id
            )
                ? prevPinned.filter((pinned) => pinned.id !== contest.id)
                : [...prevPinned, contest];
    
            const sortedPinnedContests = newPinnedContests.sort((a, b) => {
                return new Date(a.start) - new Date(b.start); 
            });

            localStorage.setItem(
                "pinnedContests",
                JSON.stringify(sortedPinnedContests)
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
                    <div className="text-center text-[14px] text-red-500 p-4">{error}</div>
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

export default SelectedPlatformsPage;
