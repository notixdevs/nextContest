const PlatformItem = ({ platform, isSelected, onToggle }) => {
    return (
        <div className="flex items-center justify-between bg-gray-200 p-3 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
                <img
                    src={platform.image}
                    alt={platform.name}
                    className="w-10 h-10 rounded-full"
                />
                <h2 className="font-bold m-0">{platform.name}</h2>
            </div>
            <label className="relative inline-block w-12 h-6">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(platform)}
                    className="sr-only peer"
                />
                <span className="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-300 peer-checked:bg-black"></span>
                <span className="absolute top-1 left-1 h-4 w-4 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-6"></span>
            </label>
        </div>
    );
};

export default PlatformItem;
