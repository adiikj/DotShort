import React from 'react';
import { Link } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    return (
        <div className="h-screen relative flex flex-col items-center justify-center text-white px-4 sm:px-6">
            {/* Particle Effect Background */}
            <Particles
                className="absolute inset-0 z-0"
                options={{
                    particles: {
                        number: {
                            value: 100, // Adjust particle count for performance on mobile
                            density: { enable: true, value_area: 800 },
                        },
                        size: {
                            value: 4, // Slightly smaller particles for mobile
                        },
                        move: {
                            enable: true,
                            speed: 2, // Slower movement for smaller screens
                            direction: 'none',
                            random: true,
                            straight: false,
                            out_mode: 'out',
                        },
                        line_linked: {
                            enable: true,
                            distance: 100,
                            color: '#ffffff',
                            opacity: 0.2,
                            width: 1,
                        },
                        opacity: {
                            value: 0.6,
                            random: true,
                            anim: {
                                enable: true,
                                speed: 1,
                                opacity_min: 0.1,
                            },
                        },
                    },
                    interactivity: {
                        events: {
                            onhover: {
                                enable: true,
                                mode: 'repulse',
                            },
                        },
                    },
                    retina_detect: true,
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* Heading */}
                <motion.h1
                    className="text-5xl sm:text-6xl font-extrabold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-600"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Short your dotcom with{' '}
                    <span
                        className="text-teal-400 font-extrabold text-shadow-highlight"
                        style={{
                            textShadow: '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.4)',
                        }}
                    >
                        DotShort
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    className="text-base sm:text-xl text-gray-300 mb-4 sm:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    Simplify your URLs with ease and efficiency.
                </motion.p>

                {/* No login text */}
                <motion.p
                    className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 italic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    No login required! Start shortening your links or generating QR codes instantly.
                </motion.p>

                {/* Action Buttons */}
                <div className="flex flex-row justify-center items-center gap-4 sm:gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                    >
                        <Link to="/shortenlink">
                            <button className="bg-teal-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-transparent hover:text-teal-500 hover:border-teal-500 hover:border-2 transition duration-300 shadow-lg transform hover:scale-105 border-2 border-transparent">
                                Shorten a Link
                            </button>
                        </Link>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.9 }}
                    >
                        <Link to="/generateqr">
                            <button className="bg-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-transparent hover:text-purple-500 hover:border-purple-500 hover:border-2 transition duration-300 shadow-lg transform hover:scale-105 border-2 border-transparent">
                                Generate QR
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
