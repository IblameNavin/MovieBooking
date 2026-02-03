import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-black text-white py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
                <h3 className="text-xl font-bold mb-4">CineBook</h3>
                <p className="text-gray-400 mb-4">
                    Your one-stop destination for booking movie tickets.
                </p>
                <div className="flex justify-center gap-6 mb-6">
                    <a href="#" className="hover:text-gray-300 transition">About Us</a>
                    <a href="#" className="hover:text-gray-300 transition">Contact</a>
                    <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
                </div>
                <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} CineBook. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
