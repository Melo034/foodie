import type React from "react"
import { useState } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Sidebar from "../Components/Sidebar"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/images/avatar-2.jpg",
        bio: "Food enthusiast and amateur chef. I love exploring Sierra Leonean cuisine and sharing my family recipes.",
        location: "Freetown, Sierra Leone",
        website: "https://johndoe.com",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProfile((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSaving(false)
        setIsEditing(false)
        toast("Profile updated", {
            description: "Your profile has been updated successfully.",
        })
    }

    return (
        <>
            <Navbar />
            <div className=" py-20 sm:py-32 container mx-auto px-4 md:px-6 max-w-6xl">
                <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 py-8">
                    <Sidebar />
                    <main className="flex w-full flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">My Profile</h1>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)} className="bg-[#0C713D] hover:bg-[#095e32]">
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 bg-[#0C713D] rounded-full p-1 cursor-pointer">
                                            <Camera className="h-4 w-4 text-white" />
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Click the camera icon to change your profile picture</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" value={profile.name} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        className="min-h-[100px]"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            value={profile.location}
                                            onChange={handleChange}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-[#0C713D] hover:bg-[#095e32]" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                        <p className="mt-1">{profile.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                        <p className="mt-1">{profile.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                    <p className="mt-1">{profile.bio}</p>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                        <p className="mt-1">{profile.location}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div >
            <Footer />
        </>
    )
}

export default Profile