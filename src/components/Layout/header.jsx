import SearchBar from '../SearchBar.jsx';

export default function Header() {
    return(
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-dark-bg z-10 py-4">
            {/* navigation arrows */}
            <div className="flex space-x-2">
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <svg className="w-5 h-5 text-text-light" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                </button>
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <svg className="w-5 h-5 text-text-light" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                </button>
            </div>

            {/* search bar */}
            <div className="flex-grow mx-4 max-w-xl">
                <SearchBar />
            </div>

            {/* user profile */}
            <div className="flex items-center space-x-2">
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <svg className="w-6 h-6 text-text-light" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a4 4 0 00-4 4h8a4 4 0 00-4-4z" clipRule="evenodd"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}