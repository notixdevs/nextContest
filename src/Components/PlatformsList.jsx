import PlatformItem from "./PlatformItem";

const PlatformsList = ({ platformsInfo, selectedPlatforms, onToggle }) => {
    return (
        <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 gap-4">
                {platformsInfo.map((platform, index) => (
                    <PlatformItem
                        key={index}
                        platform={platform}
                        isSelected={selectedPlatforms.includes(platform.url)}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </div>
    );
};

export default PlatformsList;
