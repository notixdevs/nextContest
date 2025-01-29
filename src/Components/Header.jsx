import { IoSettingsSharp } from "react-icons/io5";

const Header = ({ onSettingsClick }) => (
    <div className="bg-white sticky top-0 z-10 shadow-md p-3 h-[64px]">
        <div className="flex justify-between items-center h-[32px]">
            <h1 className="text-lg transform translate-y-2 font-bold">
                Upcoming Contests
            </h1>
            <button
                className="p-2 hover:bg-gray-100 rounded-full transition w-10 h-10 flex items-center justify-center"
                onClick={onSettingsClick}
            >
                <IoSettingsSharp className="w-5 h-5" />
            </button>
        </div>
        <hr className="w-full border-t-2 border-gray-300 mt-2" />
    </div>
);

export default Header;
