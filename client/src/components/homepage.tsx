import '../App.css'
import { useEffect, useState } from 'react';

function HomePage() {
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); 

    return (
        <div className='flex-container'>
        { isMobile && 
            <h1 className='chakra-petch-regular text-white'>Mobile Home</h1>
        }
        { !isMobile && 
            <h1 className='chakra-petch-regular text-white'>Home</h1>
        }
        </div>
    )
}

export default HomePage
