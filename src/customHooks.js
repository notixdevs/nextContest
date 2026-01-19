export const isContestLive = (start, end,reminder=false) => {

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
    const fiveMinutesInMilliseconds = 5 * 60 * 1000;

    if (reminder && diffInMilliseconds <= fiveMinutesInMilliseconds && diffInMilliseconds > 0) {
        return "REMIND";
    }

    const formattedDays = String(diffInDays).padStart(2, "0");
    const formattedHours = String(diffInHours).padStart(2, "0");
    if (diffInMilliseconds >= 0 && diffInMilliseconds < oneDayInMilliseconds) {
        return `${formattedHours} hours`;
    } else if (diffInDays >= 1) {
        return `${formattedDays} days`;
    }

    return "Upcoming";
};


export const calculateDuration = (duration) => {
    if (!duration || duration <= 0) return "Not Added";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
};


