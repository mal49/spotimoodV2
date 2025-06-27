import SearchBar from '../SearchBar.jsx';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function Header() {
    return(
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-dark-bg z-10 py-4">
            {/* navigation arrows */}
            <div className="flex space-x-2">
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <ChevronLeft className="w-5 h-5 text-text-light" />
                </button>
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <ChevronRight className="w-5 h-5 text-text-light" />
                </button>
            </div>

            {/* search bar */}
            <div className="flex-grow mx-4 max-w-xl">
                <SearchBar />
            </div>

            {/* user profile */}
            <div className="flex items-center space-x-2">
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <User className="w-6 h-6 text-text-light" />
                </button>
            </div>
        </div>
    );
}