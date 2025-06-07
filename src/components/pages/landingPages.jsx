
export default function LandingPage({onGetStarted, onSignIn}){
    return(
        <div className='flex flex-col h-full w-full justify-between items-center text-center p-8'>
            <nav className='w-full flex justify-between p-4 absolute top-0 right-0 z-10'>
                <a href="#" className='text-[#333] font-semibold text-lg hover:text-[#AA60C8] transition-colors'>spotimood</a>
                <div className='space-x-8'>
                    <a href="#" className='text-[#333] font-semibold text-lg hover:text-[#AA60C8] transition-colors'>Home</a>
                    <a href="#" className='text-[#333] font-semibold text-lg hover:text-[#AA60C8] transition-colors'>About</a>
                    <a href="#" className='text-[#333] font-semibold text-lg hover:text-[#AA60C8] transition-colors'>Service</a>
                    <a href="#" className='text-[#333] font-semibold text-lg hover:text-[#AA60C8] transition-colors'>Contact</a>
                </div>
            </nav>

            <div className='flex-grow flex items-center justify-center w-full'>
                <div className='flex flex-col md:flex-row items-center justify-center max-w-5x1 mx-auto px-4'>
                    <div className='flex-1 text-left md:mr-8 mb-8 md:mb-0'>
                        <h1 className='font-Playfair-Display text-7x1 font-bold text-[#333] mb-4 drop-shadow-sm'>Spotimood</h1>
                        <p className='text-[#555] text-x1 leading-relaxed mb-8 max-w-md'>
                        Spotimood is a website that allows you to explore and enhance your emotional
                        wellbeing. Create personalized mood spaces, track your emotional journey, and
                        discover new ways to express yourself.
                        </p>
                        <button onClick={onGetStarted} className='bg-[#AA60C8] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#C879E6] transition-all duration-300 transform hover:scale-105'>Get Started</button>
                        <button onClick={onSignIn} className='bg-[#AA60C8] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg ml-3 hover:bg-[#C879E6] transition-all duration-300 transform hover:scale-105'>Sign In</button>
                    </div>
                    <div className='flex-none bg-[#D4C3ED] w-[250px] h-[250px] rounded-lg shadow-xl flex items-center justify-center text-[#999] text-2xl font-semibold'>
                        250x250
                    </div>
                </div>
            </div>
        </div>
    );
}