const Footer = () => {
    return (
        <footer className="bg-white text-center text-gray-800 text-sm py-[6px] px-8 mt-0">
            <div className="flex justify-between items-center">
                <a href="https://forms.gle/iM17sUSwyJ17ayDr6" className="font-semibold hover:text-blue-500" target="_blank" rel="noopener noreferrer">
                    Report Issue
                </a>
                <a href="https://github.com/notixdevs/nextContest" className="font-semibold hover:text-blue-500" target="_blank" rel="noopener noreferrer">
                    Rate Us
                </a>
                <a href="https://notixdevs.netlify.app" className="font-semibold hover:text-blue-500" target="_blank" rel="noopener noreferrer">
                    Website
                </a>
            </div>
        </footer>
    );
};

export default Footer;
