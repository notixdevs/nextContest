import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../Components/Footer";
import PlatformsList from "../Components/PlatformsList";
import { AiOutlineMinusCircle, AiFillHome } from "react-icons/ai";
import PlatformData from "../data/PlatformsData";

const Platforms = () => {
    const navigate = useNavigate();

    const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
        const storedPlatforms = localStorage.getItem("selectedPlatforms");
        return storedPlatforms ? JSON.parse(storedPlatforms) : 
            ["codeforces.com","codechef.com","leetcode.com","atcoder.jp","naukri.com/code360","geeksforgeeks.org"];
    });

    const handleToggleSwitch = (platform) => {
        setSelectedPlatforms((prev) => {
            const newSelection = prev.includes(platform.url)
                ? prev.filter((url) => url !== platform.url)
                : [...prev, platform.url];
            return newSelection;
        });
    };

    useEffect(() => {
        localStorage.setItem(
            "selectedPlatforms",
            JSON.stringify(selectedPlatforms)
        );
    }, [selectedPlatforms]);

    return (
        <div className="flex flex-col h-[600px] w-[400px] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-white sticky top-0 z-10 shadow-md p-3 h-[64px]">
                <div className="flex justify-between items-center h-[32px]">
                    <h1 className="text-lg transform translate-y-2 font-bold">
                        Choose Platform
                    </h1>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full transition relative w-10 h-10 flex items-center justify-center"
                        onClick={() => {
                            if (selectedPlatforms.length === 0) {
                                return;
                            }
                            navigate("/");
                        }}
                    >
                        {selectedPlatforms.length === 0 ? (
                            <div className="relative group">
                                <AiOutlineMinusCircle className="w-5 h-5 text-red-500" />
                                <div className="absolute transform -translate-x-[85px] top-8 min-w-[120px] bg-gray-900 text-white text-sm font-medium rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Choose atleast one platform
                                </div>
                            </div>
                        ) : (
                            <AiFillHome className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <hr className="w-full border-t-2 border-gray-300 mt-2" />
            </div>
            <PlatformsList
                platformsInfo={PlatformData}
                selectedPlatforms={selectedPlatforms}
                onToggle={handleToggleSwitch}
            />
            <Footer />
        </div>
    );
};

export default Platforms;
