import React from 'react';
import Header from '../dashboard/Header';

const ProtectedLink: React.FC = () => {
    return (
        <div>
            <Header />
            <main className="flex flex-col items-center justify-center h-screen text-white">
                <p className="text-4xl text-purple-500 font-bold mb-6">UNDER CONSTRUCTION!!</p>
                <p className="text-2xl text-teal-500 font-semibold">COME BACK LATER !</p>
            </main>
        </div>
    );
};

export default ProtectedLink;