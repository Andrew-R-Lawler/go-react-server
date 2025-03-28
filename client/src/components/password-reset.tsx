import '../App.css'
import { useParams } from 'react-router-dom'

function PasswordReset() {
    const { token } = useParams();

    return (
        <div className='flex-container'>
            <h1 className='chakra-petch-regular text-white'>Password Reset: {token}</h1>
        </div>
    )
}

export default PasswordReset
