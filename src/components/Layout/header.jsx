import SearchBar from '../SearchBar.jsx';
import { User } from 'lucide-react';

export default function Header() {
    return(
        <div className="relative flex justify-center items-center mb-6 sticky top-0 bg-dark-bg z-10 py-4 px-4">
            {/* search bar - centered */}
            <div className="w-full max-w-2xl">
                <SearchBar />
            </div>

            {/* user profile - positioned absolutely on the right */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <button className="bg-dark-card p-2 rounded-full hover:bg-dark-hover transition-colors">
                    <User className="w-6 h-6 text-text-light" />
                </button>
            </div>
        </div>
    );
}