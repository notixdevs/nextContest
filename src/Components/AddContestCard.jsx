import { useState, useEffect } from "react";
import PlatformData from "../data/PlatformsData";
import { FaCheck } from "react-icons/fa";

const AddContestCard = ({ onSave }) => {
    const [name, setName] = useState("");
    const [start, setStart] = useState("");
    const [duration, setDuration] = useState("");
    const [link, setLink] = useState("");
    const [isValid, setIsValid] = useState(false);

    const manualLogo = PlatformData.find((p) => p.name === "Manual")?.image;

    useEffect(() => {
        setIsValid(name.trim() !== "" && start !== "");
    }, [name, start]);

    const handleSave = () => {
        if (isValid) {
            onSave({ name, start, duration, link });
        }
    };

    return (
        <div className="bg-gray-200 border rounded-lg p-3 py-3 grid grid-cols-[auto,1fr,auto] gap-3 items-center shadow-lg relative mb-4 mt-4 min-h-[95px]">
            {/* Logo Column */}
            <div className="flex justify-center items-center w-10">
                <img
                    className="transform -translate-y-2 w-10 h-10 rounded-full"
                    src={manualLogo}
                    alt="Manual Logic"
                />
            </div>

            {/* Content Column */}
            <div className="flex flex-col justify-center max-w-[200px] gap-2">
                {/* Row 1: Name */}
                <input
                    type="text"
                    placeholder="Contest Name"
                    className="w-full bg-white/50 hover:bg-white focus:bg-white border-b border-transparent focus:border-blue-500 text-gray-800 text-sm font-medium rounded-sm px-1 py-0 focus:outline-none placeholder-gray-400 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

                {/* Row 2: Start Time */}
                <div className="flex items-center gap-1 text-[13px] text-gray-600">
                    <span className="font-normal">Start:</span>
                    <input
                        type="datetime-local"
                        className="bg-white/50 hover:bg-white focus:bg-white border-b border-transparent focus:border-blue-500 text-gray-800 rounded-sm px-1 py-0 focus:outline-none h-[20px] text-[13px] w-full"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </div>

                {/* Row 3: Duration & Link */}
                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1">
                        <span className="font-normal">Duration:</span>
                        <input
                            type="text"
                            placeholder="min"
                            className="bg-white/50 hover:bg-white focus:bg-white border-b border-transparent focus:border-blue-500 text-gray-800 rounded-sm px-1 py-0 focus:outline-none w-[35px] h-[20px] text-center text-[13px]"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                    </div>
                     <input
                        type="text"
                        placeholder="Link (opt)"
                        className="bg-white/50 hover:bg-white focus:bg-white border-b border-transparent focus:border-blue-500 text-gray-800 rounded-sm px-1 py-0 focus:outline-none flex-1 h-[20px] min-w-0 text-[13px]"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />
                </div>
            </div>

            {/* Right Column: Tick at Top, Empty at Bottom */}
            <div className="flex flex-col items-end justify-between h-full py-1">
                 {/* Top: Tick Button (Matches Star Position) */}
                <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className={`transition transform hover:scale-105 translate-y-[22px]  -translate-x-[5px] block leading-none text-2xl ${
                        isValid 
                            ? "text-blue-500 hover:text-blue-600 cursor-pointer" 
                            : "text-gray-400 cursor-not-allowed scale-90"
                    }`}
                    title={isValid ? "Save" : "Name and Start Time required"}
                >
                    <FaCheck className="w-[22px] h-[22px] transform translate-y-[2px]" />
                </button>
            </div>
        </div>
    );
};

export default AddContestCard;
