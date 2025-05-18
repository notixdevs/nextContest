import React from "react";

function ContestStatusBadge(props) {
    const { status } = props;
    if (status === "LIVE") {
        return (
            <div className="mt-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded-lg shadow-md transition bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1">
                <div className="transform -translate-y-[0.5px] w-2 h-2 rounded-full bg-red-500"></div>
                LIVE
            </div>
        );
    }
    if (status.includes("hours") || status.includes("days")) {
        const isHours = status.includes("hours");
        return (
            <div className="mt-1 px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded-lg shadow-md transition bg-gray-200 text-gray-700 hover:bg-gray-300">
                <span
                    className={`${
                        isHours ? "text-blue-500" : "text-gray-700"
                    } font-extrabold text-[14px]`}
                >
                    &lt;&nbsp;
                </span>
                {status.substring(0, 2)}
                {isHours ? "H" : "D"}
            </div>
        );
    }

    return null;
}

export default ContestStatusBadge;
