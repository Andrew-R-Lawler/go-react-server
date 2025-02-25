import { useCookies } from 'react-cookie'
import axios from 'axios'

export const login = async (email: FormDataEntryValue | null, password: FormDataEntryValue | null) => {
    const user = {
        email: email,
        password: password,
    }
    try {
        const response = await axios.post('/api/user/login', user)
        return response.data.token;
    } catch (error) {
        console.error(error)
    }
}

export const useAuth = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['jwtToken'])

    const saveToken = (token: string) => {
        setCookie('jwtToken', token, {
            path: '/',
            maxAge: 24 * 60 * 60,
            secure: false,
            httpOnly: false,
        })
    }
    const deleteToken = () => {
        removeCookie('jwtToken', { path: '/' })
    }
    const getToken = () => {
        return cookies.jwtToken
    }
    const isAuthenticated = () => {
        return !!cookies.jwtToken
    }
    return { saveToken, getToken, deleteToken, isAuthenticated }
}

