const TimeDisplay = ({ startTime, userTimeZone = "Asia/Kolkata" }) => {
    const formatTime = (gmtTimeString) => {
        try {
            const gmtDate = new Date(gmtTimeString + "Z");

            if (isNaN(gmtDate.getTime())) {
                throw new Error("Invalid date");
            }

            // Format the date and time according to user's timezone
            const formatter = new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: userTimeZone,
                hour12: true,
            });

            let formattedTime = formatter.format(gmtDate);

            formattedTime = formattedTime.replace(/am|pm/i, (match) =>
                match.toUpperCase()
            );

            // For debugging
            // console.log({
            //   input: gmtTimeString,
            //   parsed: gmtDate.toISOString(),
            //   output: formattedTime,
            //   timezone: userTimeZone
            // });

            return formattedTime;
        } catch (error) {
            console.error("Error formatting time:", error);
            return "Invalid date";
        }
    };

    return (
        <div className="text-gray-600 mt-1 text-[13px]">
            Start: {formatTime(startTime)}
        </div>
    );
};

export default TimeDisplay;
