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
        <div className="bg-gray-200 border rounded-lg p-3 h-[81.6px] grid grid-cols-[auto,1fr,auto] gap-3 items-center hover:shadow-lg">
            {/* Logo Column */}
            <div className="flex justify-center items-center w-10">
                <img
                    className="transform -translate-y-2 w-10 h-10 rounded-full"
                    src={logoSrc}
                    alt="Platform Logo"
                    title={
                        contest.resource.split(".")[0].charAt(0).toUpperCase() +
                        contest.resource.split(".")[0].slice(1)
                    }
                />
            </div>

            <div className="flex flex-col justify-center max-w-[200px]">
                <a
                    href={contest.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-800 hover:text-blue-500 text-sm"
                >
                    <span
                        className="line-clamp-1 overflow-hidden text-ellipsis break-words"
                        title={contest.event}
                    >
                        {contest.event}
                    </span>
                </a>

                <TimeDisplay
                    startTime={contest.start}
                    userTimeZone={userTimeZone}
                />
                <p className="text-gray-600 text-[13px]">
                    Duration: {duration}
                </p>
            </div>

            <div className="flex flex-col items-center justify-center h-full w-10 -translate-y-[5px] -translate-x-[2px]">
                <span
                    className={`cursor-pointer text-yellow-500 scale-100
                    text-3xl transition transform hover:scale-105`}
                >
                    ★
                </span>
                <ContestStatusBadge status={contestStatus} />
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
            <div className="min-h-screen bg-gray-100 p-6">
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
            <div className="min-h-screen bg-gray-100 p-6">
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
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-2xl mx-auto flex flex-col ">
                <h2 className="text-xl font-bold align-items  text-gray-800 mb-2">
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
            <a
                href={contest.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 text-center w-full text-sm"
            >
                Go to Contest
            </a>
        </div>
    );
};

export default ReminderPage;
