import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { UserContext } from '../UserContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'

function APIManagement() {
    const [passwords, setPasswords] = useState([])
    const [formData, setFormData] = useState({ url: "", password: "", description: '', fileUpload: '' });
    const [isUpdating, setIsUpdating] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { isLogin, setIsLogin, currentUser, setCurrentUser } = useContext(UserContext)
    const token = localStorage.getItem('token')
    const [showPopup, setShowPopup] = useState(false)
    const [showPasswordsPopup, setShowPasswordsPopup] = useState(false);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        try {
            if (isUpdating) {
                const updated = await axios.put(`${import.meta.env.VITE_URL}/update/${formData._id}`, formData, { headers: { Authorization: token } })
                toast.success(updated.data.message)
                setPasswords(prev => prev.map(item => item._id === formData._id ? updated.data.entry : item))
                setIsUpdating(false)
            } else {
                const response = await axios.post(`${import.meta.env.VITE_URL}/add`, formData, { headers: { Authorization: token } })
                toast.success(response.data.message);
                setPasswords(prev => [...prev, response.data.entry])
            }
            setFormData({ url: "", password: "", description: '', fileUpload: '' })
        } catch (error) {
            toast.error("Unable to add/update Password, Try after sometimes")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setFormData({ url: "", password: "", description: '', fileUpload: '' })
        setIsUpdating(false)
        if (passwords.length === 0) {
            alert("No passwords available to delete!");
            return;
        }
        const confirmation = confirm("Are You Sure to delete all records?")
        if (confirmation) {
            setLoading(true)
            const response = await axios.delete(`${import.meta.env.VITE_URL}/delete`, { headers: { Authorization: token } })
            toast.success(response.data.message);
            setPasswords([])
        }
        setLoading(false)
    }

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_URL}/find`, { headers: { Authorization: token } })
            .then(response => {
                setPasswords(response.data.entries);
            })
            .catch((err) => {
                console.error("Error fetching passwords:", err);
            })
    }, [])

    const handleDeleteById = async (id) => {
        setFormData({ url: "", password: "", description: '', fileUpload: '' })
        setIsUpdating(false)
        const confirmation = confirm(`Are You Sure to delete?`)
        if (confirmation) {
            try {
                setLoading(true)
                const response = await axios.delete(`${import.meta.env.VITE_URL}/delete/${id}`, { headers: { Authorization: token } })
                toast.success(response.data.message)
                setPasswords(prev => prev.filter(item => item._id !== id))
            } catch (error) {
                toast.error("Failed to Delete Entry")
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteUserByEmail = async () => {
        const confirmation = confirm(`Are You Sure to delete?`)
        if (confirmation) {
            try {
                setLoading(true)
                const response = await axios.delete(`${import.meta.env.VITE_URL}/user/delete/${currentUser.email}`, { headers: { Authorization: token } })
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setCurrentUser(null)
                setIsLogin(true);
                toast.success(response.data.message)
                navigate('/login')
            } catch (error) {
                toast.error("Failed to Delete Entry")
            } finally {
                setLoading(false)
            }
        }
    }

    const handleUpdateById = async (id) => {
        setShowPasswordsPopup(false)
        const selected = passwords.find(item => item._id === id)
        if (selected) {
            setFormData({ _id: selected._id, url: selected.url, password: selected.password, description: selected.description, fileUpload: selected.fileUpload })
            setIsUpdating(true)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCurrentUser(null);
        setIsLogin(true);
        toast.success("Logged out successfully!");
        navigate("/login", { replace: true });
    }

    return (
        <>
            <div className="bg-white shadow-md p-4 flex justify-between items-center rounded-t-lg max-w-3xl mx-auto relative">
                <div className="text-xl font-bold text-gray-800">
                    {"Lockify </>"}
                </div>
                <div className="relative">
                    <button onClick={() => setShowPopup(!showPopup)} className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition duration-200 cursor-pointer">
                        <User />
                    </button>

                    {showPopup && (
                        <div className="absolute right-0 mt-2 w-60 bg-white border rounded-xl shadow-lg p-4 z-50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                    {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="text-gray-800 font-semibold text-sm">
                                        Hello, {currentUser?.firstName?.toUpperCase()}!
                                    </p>
                                    <p className="text-gray-500 text-xs">{currentUser?.email}</p>
                                </div>
                            </div>

                            <hr className="my-2 border-gray-200" />

                            <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200 text-sm font-semibold cursor-pointer">
                                Logout
                            </button>

                            <hr className="my-2 border-gray-200" />

                            <button onClick={handleDeleteUserByEmail} disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200 text-sm font-semibold cursor-pointer">
                                {loading ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    )}
                </div>
            </div >

            <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md mt-8">
                <h1 className="text-3xl font-bold text-center mb-4">{isUpdating ? "Update Password" : "Add Password"}</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
                    <input type="text" name="url" value={formData.url} placeholder="Enter Website URL" onChange={handleChange} className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                    <div className="relative w-full">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} placeholder="Enter Password" onChange={handleChange} required className="w-full border border-gray-300 rounded px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 font-semibold cursor-pointer">
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <textarea name="description" value={formData.description} placeholder="Enter Something (Optional)" onChange={handleChange} className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y" />
                    {/* <label className="w-full border border-gray-300 rounded px-4 py-2 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-400">
                        {formData.fileUpload ? formData.fileUpload.name : "Choose a file"}
                        <input type="file" name="fileUpload" onChange={handleChange} className="hidden" onChange={(e) => setFormData(prev => ({ ...prev, fileUpload: e.target.fileUpload[0] }))} required/>
                    </label> */}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer" disabled={loading}>
                        {loading ? isUpdating ? "Updating..." : "Adding" : isUpdating ? "Update Password" : "Add Password"}
                    </button>
                </form>

                <div className="flex justify-center mt-16 mb-2">
                    <button onClick={() => setShowPasswordsPopup(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer">
                        View Passwords
                    </button>
                </div>

                {showPasswordsPopup && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-3xl relative max-h-[90vh] flex flex-col">
                            <h1 className="text-2xl font-bold mb-4">List of Passwords</h1>
                            <button onClick={() => setShowPasswordsPopup(false)} className="absolute top-0 right-3 hover:text-gray-800 font-bold text-3xl text-red-500 cursor-pointer">
                                ×
                            </button>
                            <div className="flex flex-col flex-shrink-0">
                                {passwords.length > 1 && (
                                    <div className="flex justify-center mb-6">
                                        <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer">
                                            Delete All Passwords
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-4 overflow-y-auto pr-2 flex-1">
                                {passwords.length > 0 ? (
                                    passwords.map((item) => (
                                        <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                            <div className="flex-1">
                                                <h2 className="font-semibold text-lg mb-1">
                                                    Website URL: <span className="font-normal">{item.url}</span>
                                                </h2>
                                                <h2 className="font-semibold text-lg space-x-2">
                                                    Password: <span className="font-normal">{item.password}</span>
                                                    <button onClick={() => {
                                                        navigator.clipboard.writeText(item.password);
                                                        toast.success("Password copied!");
                                                    }} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold transition duration-200 cursor-pointer">
                                                        Copy
                                                    </button>
                                                </h2>
                                                <h2 className="font-semibold text-lg mb-1">
                                                    Description: <span className="font-normal">{item.description || "N/A"}</span>
                                                </h2>
                                            </div>

                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                <button onClick={() => handleUpdateById(item._id)} className="bg-green-400 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer">
                                                    Update
                                                </button>
                                                <button onClick={() => handleDeleteById(item._id)} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer">
                                                    {loading ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 text-lg py-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                        No passwords to show. Try to Add One
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
};

export default APIManagement