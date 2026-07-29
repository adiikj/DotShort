import React from 'react';
import Header from '../dashboard/Header';

const Profile: React.FC = () => {
    const dummyData = {
        email: 'dummyemail@example.com',
        username: 'dummyuser',
        bio: 'This is a dummy bio for the user profile.',
        profilePicture: 'https://www.example.com/dummy-profile-pic.jpg', // URL for a dummy profile image
    };

    return (
        <div className="min-h-screen  text-white">
            <Header />
            <main className="flex flex-col items-center justify-center py-12">
                <div className="flex flex-col bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-lg w-full sm:w-96">
                    {/* Profile Picture */}
                    <div className="flex justify-center mb-6">
                        <img
                            src={dummyData.profilePicture}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-teal-500"
                        />
                    </div>

                    {/* User Information */}
                    <div className="text-center mb-4">
                        <p className="text-lg font-semibold">
                            <strong>Email:</strong> {dummyData.email}
                        </p>
                        <p className="text-lg font-semibold">
                            <strong>Username:</strong> {dummyData.username}
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="text-center">
                        <p className="text-sm italic text-gray-400">
                            <strong>Bio:</strong> {dummyData.bio}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
