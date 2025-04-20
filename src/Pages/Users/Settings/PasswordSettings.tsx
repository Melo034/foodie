import type React from "react"
import { useState } from "react"
import { Key, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Footer } from "@/components/utils/Footer"
import { Navbar } from "@/components/utils/Navbar"
import Sidebar from "../Components/Sidebar"

const PasswordSettings = () => {

    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSaving(false)
        setIsChangingPassword(false)
        toast("Password updated", {
            description: "Your password has been changed successfully.",
        })
    }

    const handleSaveSettings = async () => {
        setIsSaving(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSaving(false)
        toast("Security settings saved", {
            description: "Your security preferences have been updated successfully.",
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
                            <h1 className="text-2xl font-bold">Security</h1>
                        </div>

                        <div className="space-y-8">
                            {/* Password Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Key className="h-5 w-5 text-gray-500" />
                                    <h2 className="text-lg font-medium">Password</h2>
                                </div>

                                {isChangingPassword ? (
                                    <form onSubmit={handlePasswordChange} className="space-y-4 pl-7">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">Current Password</Label>
                                            <Input id="current-password" type="password" required />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input id="new-password" type="password" required />
                                            <p className="text-xs text-gray-500">
                                                Password must be at least 8 characters and include a number and special character.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                                            <Input id="confirm-password" type="password" required />
                                        </div>

                                        <div className="flex justify-end gap-4">
                                            <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="bg-[#0C713D] hover:bg-[#095e32]" disabled={isSaving}>
                                                {isSaving ? "Updating..." : "Update Password"}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="pl-7">
                                        <p className="text-gray-600 mb-4">
                                            Your password was last changed <strong>3 months ago</strong>. We recommend changing your password
                                            regularly to keep your account secure.
                                        </p>
                                        <Button className="bg-[#0C713D] hover:bg-[#095e32]" onClick={() => setIsChangingPassword(true)}>Change Password</Button>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSaveSettings} className="bg-[#0C713D] hover:bg-[#095e32]" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Security Settings"}
                                </Button>
                            </div>
                        </div>
                    </main>
                </div>
            </div >
            <Footer />
        </>
    )
}

export default PasswordSettings