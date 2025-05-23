import { useState, useEffect } from "react";
import ContestStatusBadge from "./ContestStatusBadge";
import TimeDisplay from "./TimeDisplay";
import PlatformData from "../data/PlatformsData";
import { calculateDuration, isContestLive } from "../customHooks";

const ContestCard = ({
    contest,
    logoSrc,
    contestStatus,
    duration,
    userTimeZone,
}) => {
    return (
        <div className="bg-gray-200 border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                {/* Logo Column */}
                <div className="flex justify-center items-center">
                    <img
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        src={logoSrc}
                        alt="Platform Logo"
                        title={
                            contest.resource
                                .split(".")[0]
                                .charAt(0)
                                .toUpperCase() +
                            contest.resource.split(".")[0].slice(1)
                        }
                    />
                </div>

                {/* Contest Details Column */}
                <div className="flex flex-col justify-center min-w-0">
                    <a
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-800 hover:text-blue-500 text-sm"
                    >
                        <span
                            className="block overflow-hidden text-ellipsis"
                            title={contest.event}
                        >
                            {contest.event}
                        </span>
                    </a>

                    <TimeDisplay
                        startTime={contest.start}
                        userTimeZone={userTimeZone}
                    />
                    <p className="text-gray-700 text-sm mt-1">
                        Duration: {duration}
                    </p>
                </div>

                {/* Status Column */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-yellow-500 text-2xl">★</div>
                    <ContestStatusBadge status={contestStatus} />
                </div>
            </div>
        </div>
    );
};

const ReminderPage = () => {
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        const fetchPinnedContest = () => {
            try {
                chrome.storage.local.get("pinnedContests", (result) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Error fetching pinned contests:",
                            chrome.runtime.lastError
                        );
                        setLoading(false);
                        return;
                    }

                    const pinnedContests = result.pinnedContests;

                    if (
                        Array.isArray(pinnedContests) &&
                        pinnedContests.length > 0
                    ) {
                        const contestToShow = pinnedContests.find(
                            (contest) =>
                                isContestLive(
                                    contest.start,
                                    contest.end,
                                    true
                                ) === "REMIND"
                        );

                        if (contestToShow) {
                            setContest(contestToShow);
                        }
                    }

                    setLoading(false);
                });
            } catch (error) {
                console.error("Unexpected error:", error);
                setLoading(false);
            }
        };

        fetchPinnedContest();
        const intervalId = setInterval(fetchPinnedContest, 30000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto flex flex-col ">
                    <h2 className="text-xl font-bold align-items  text-gray-800 mb-4">
                        Contest Starts Soon!!
                    </h2>

                    <div className="flex justify-center items-center py-8">
                        <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center py-8">
                        <div className="text-gray-500 text-4xl mb-4">📌</div>
                        <p className="text-gray-600 text-lg">
                            No pinned contests available
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Pin a contest to see reminders here
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const logoSrc = PlatformData.find(
        (platformInfo) => platformInfo.url === contest.resource.toLowerCase()
    )?.image;

    const contestStatus = isContestLive(contest.start, contest.end);
    const duration = calculateDuration(contest.duration);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto flex flex-col ">
                <h2 className="text-xl font-bold align-items  text-gray-800 mb-4">
                    Contest Starts Soon!!
                </h2>

                {/* Contest Card */}
                <ContestCard
                    contest={contest}
                    logoSrc={logoSrc}
                    contestStatus={contestStatus}
                    duration={duration}
                    userTimeZone={userTimeZone}
                />
            </div>
        </div>
    );
};

export default ReminderPage;
