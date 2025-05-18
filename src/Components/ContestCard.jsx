import ContestStatusBadge from "./ContestStatusBadge";
import TimeDisplay from "./TimeDisplay";



const ContestCard = ({
    contest,
    logoSrc,
    isPinned,
    onPinClick,
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
                    className={`cursor-pointer ${
                        isPinned
                            ? "text-yellow-500 scale-100"
                            : "scale-90 text-gray-400"
                    } text-3xl transition transform hover:scale-105`}
                    onClick={() => onPinClick(contest)}
                >
                    ★
                </span>
                <ContestStatusBadge status={contestStatus} />
            </div>
        </div>
    );
};

export default ContestCard;
