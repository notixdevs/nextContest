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
    isManual,
    onDelete,
}) => {
    return (
        <div className="bg-gray-200 border rounded-lg p-3 pt-2 h-[81.6px] grid grid-cols-[auto,1fr,auto] gap-3 items-center hover:shadow-lg">
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
                {isManual ? (
                     <button
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        onClick={() => onDelete(contest)}
                        title="Delete Contest"
                    >
                         {/* Simple Trash Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                ) : (
                    <span
                        title="Remind Before Contest"
                        className={`cursor-pointer ${
                            isPinned
                                ? "text-yellow-500 scale-100"
                                : "scale-90 text-gray-400"
                        } text-3xl transition transform hover:scale-105`}
                        onClick={() => onPinClick(contest)}
                    >
                        ★
                    </span>
                )}
    <ContestStatusBadge status={contestStatus} />
</div>

        </div>
    );
};

export default ContestCard;
