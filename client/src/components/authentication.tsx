import axios from 'axios'

export const login = async (email: FormDataEntryValue | null, password: FormDataEntryValue | null) => {
    const user = {
        email: email,
        password: password,
    }
    try {
        const response = await axios.post('/api/user/login', user)
        console.log(response.data.message)
        return response.data.message;
    } catch (error) {
        console.error(error)
    }
}
