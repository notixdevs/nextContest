import { IoSettingsSharp } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

const Header = ({ onSettingsClick, onAddClick, isAdding, isEditing }) => (
    <div className="bg-white sticky top-0 z-10 shadow-md p-3 h-[64px]">
        <div className="flex justify-between items-center h-[32px]">
            <h1 className="text-lg transform translate-y-2 font-bold">
                Upcoming Contests
            </h1>
            <div className="flex items-center gap-2">
                <button
                    className={`p-2 hover:bg-gray-100 rounded-full transition-transform duration-300 w-10 h-10 flex items-center justify-center   ${
                        isAdding && !isEditing ? "rotate-45" : "rotate-0"
                    }`}
                    onClick={onAddClick}
                    title={isAdding ? (isEditing ? "Delete Contest" : "Cancel") : "Add Contest"}
                >
                    {isEditing ? (
                        <FaTrash className="text-red-500 w-4 h-4" />
                    ) : (
                        <span className="text-3xl font-bold -translate-y-[2px]  leading-none select-none">
                            +
                        </span>
                    )}
                </button>
                <button
                    className="p-2 hover:bg-gray-100 rounded-full transition w-10 h-10 flex items-center justify-center"
                    onClick={onSettingsClick}
                    title="Settings"
                >
                    <IoSettingsSharp className="w-5 h-5" />
                </button>
            </div>
        </div>
        <hr className="w-full border-t-2 border-gray-300 mt-2" />
    </div>
);

export default Header;
