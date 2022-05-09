import { AUTH_TOKEN } from '../config'

export const setToken = (token) => {
    localStorage.setItem(AUTH_TOKEN, token)
    return true
}

export const getToken = () => {
    return localStorage.getItem(AUTH_TOKEN)
}

export const isAuthenticated = () => {
    const token = localStorage.getItem(AUTH_TOKEN)
    return !!token
}
