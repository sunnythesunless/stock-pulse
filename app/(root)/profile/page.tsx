import { getUserProfile, updateUserProfile } from '@/lib/actions/profile.actions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { User, Mail, Globe, Target, Shield, Building2, Bell, Newspaper } from 'lucide-react';
import { INVESTMENT_GOALS, RISK_TOLERANCE_OPTIONS, PREFERRED_INDUSTRIES } from '@/lib/constants';

async function handleUpdateProfile(formData: FormData) {
    'use server';
    const data = {
        country: formData.get('country') as string,
        investmentGoals: formData.get('investmentGoals') as string,
        riskTolerance: formData.get('riskTolerance') as string,
        preferredIndustry: formData.get('preferredIndustry') as string,
        emailNotifications: formData.get('emailNotifications') === 'on',
        dailyNewsEnabled: formData.get('dailyNewsEnabled') === 'on',
    };
    await updateUserProfile(data);
    revalidatePath('/profile');
}

const ProfilePage = async () => {
    const profile = await getUserProfile();

    if (!profile) {
        redirect('/sign-in');
    }

    return (
        <div className="min-h-screen max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

            {/* User Info Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-black">{profile.name[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                        <p className="text-gray-400">{profile.email}</p>
                    </div>
                </div>
            </div>

            {/* Preferences Form */}
            <form action={handleUpdateProfile} className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Investment Preferences</h3>

                <div className="grid gap-6">
                    {/* Country */}
                    <div className="flex items-center gap-4">
                        <Globe className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Country</label>
                            <input
                                type="text"
                                name="country"
                                defaultValue={profile.country}
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Investment Goals */}
                    <div className="flex items-center gap-4">
                        <Target className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Investment Goals</label>
                            <select
                                name="investmentGoals"
                                defaultValue={profile.investmentGoals}
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            >
                                {INVESTMENT_GOALS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Risk Tolerance */}
                    <div className="flex items-center gap-4">
                        <Shield className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Risk Tolerance</label>
                            <select
                                name="riskTolerance"
                                defaultValue={profile.riskTolerance}
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            >
                                {RISK_TOLERANCE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preferred Industry */}
                    <div className="flex items-center gap-4">
                        <Building2 className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Preferred Industry</label>
                            <select
                                name="preferredIndustry"
                                defaultValue={profile.preferredIndustry}
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            >
                                {PREFERRED_INDUSTRIES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-700 my-6" />

                <h3 className="text-lg font-semibold text-white mb-6">Notification Settings</h3>

                <div className="grid gap-4">
                    {/* Email Notifications */}
                    <label className="flex items-center gap-4 cursor-pointer">
                        <Bell className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                            <span className="text-white">Email Notifications</span>
                            <p className="text-sm text-gray-500">Receive price alerts and updates via email</p>
                        </div>
                        <input
                            type="checkbox"
                            name="emailNotifications"
                            defaultChecked={profile.emailNotifications}
                            className="w-5 h-5 accent-yellow-500"
                        />
                    </label>

                    {/* Daily News */}
                    <label className="flex items-center gap-4 cursor-pointer">
                        <Newspaper className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                            <span className="text-white">Daily News Summary</span>
                            <p className="text-sm text-gray-500">Receive personalized market news every day</p>
                        </div>
                        <input
                            type="checkbox"
                            name="dailyNewsEnabled"
                            defaultChecked={profile.dailyNewsEnabled}
                            className="w-5 h-5 accent-yellow-500"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full mt-8 bg-yellow-500 text-black font-medium py-3 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
