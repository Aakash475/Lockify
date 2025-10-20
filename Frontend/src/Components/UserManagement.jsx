import axios from 'axios'
import { useContext, useEffect } from 'react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useNavigate } from 'react-router-dom'
import { UserContext } from '../UserContext'

function UserManagement() {
    const [formData, setFormData] = useState({ firstName: '', email: '', password: '', gender: '' })
    const navigate = useNavigate()
    const { isLogin, setIsLogin, loginUser } = useContext(UserContext)
    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (isLogin) {
            setLoginData(prev => ({ ...prev, [name]: value }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/register`, formData)
            toast.success(response.data.message)
            setFormData({ firstName: '', email: '', password: '', gender: '' })
            setIsLogin(true)
            navigate('/login')
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.message)
                navigate('/login')
            } else {
                toast.error("Registration Failed")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/login`, loginData)
            toast.success(response.data.message)
            loginUser(response.data.user, response.data.token);
            setLoginData({ email: '', password: '' })
            setIsLogin(false)
            navigate('/passwordmanager')
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 404) {
                    toast.error(error.response.data.message)
                } else {
                    toast.error("Login Failed")
                }
            } else {
                toast.error("Server not reachable")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="bg-white shadow-md flex items-center rounded-t-lg max-w-3xl mx-auto mb-7 h-16 px-4">
                <div className="text-xl font-bold text-gray-800">
                    {"Lockify </>"}
                </div>
            </div>
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md flex flex-col gap-6">
                {isLogin ? (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-center">Login</h2>
                        <input type="email" name="email" value={loginData.email} placeholder="Enter Email Address" onChange={handleChange} className="w-full border px-4 py-3 rounded-lg" required />
                        <div className="relative w-full">
                            <input type={showPassword ? "text" : "password"} name="password" value={loginData.password} placeholder="Enter Password" onChange={handleChange} required className="w-full border border-gray-300 rounded px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 font-semibold cursor-pointer">
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <button type="submit" className="bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" disabled={loading}>
                            {loading ? "Signing in..." : "Login"}
                        </button>
                        <p className="text-center mt-2">
                            Don't have an account?{' '}
                            <span className="text-blue-500 cursor-pointer" onClick={() => {
                                setIsLogin(false)
                                navigate('/')
                            }}>
                                Create an Account
                            </span>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
                        <input type="text" name="firstName" value={formData.firstName} placeholder="Enter First Name" onChange={handleChange} className="w-full border px-4 py-3 rounded-lg" required />
                        <input type="email" name="email" value={formData.email} placeholder="Enter your Email Address" onChange={handleChange} className="w-full border px-4 py-3 rounded-lg" required />
                        <div className="relative w-full">
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} placeholder="Enter Password" onChange={handleChange} required className="w-full border border-gray-300 rounded px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 font-semibold cursor-pointer">
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className='cursor-pointer'>
                                <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} required />{' '}Male
                            </label>
                            <label className='cursor-pointer'>
                                <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} required />{' '}Female
                            </label>
                            <label className='cursor-pointer'>
                                <input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} required />{' '}Other
                            </label>
                        </div>
                        <button type="submit" className="bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                        <p className="text-center mt-2">
                            Already have an account?{' '}
                            <span className="text-blue-500 cursor-pointer" onClick={() => {
                                setIsLogin(true)
                                navigate('/login')
                            }}>
                                Login
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </>
    )
}
export default UserManagement