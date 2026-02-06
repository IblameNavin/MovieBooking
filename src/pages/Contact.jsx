import React from "react";
import { Footer } from "../components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Contact = () => {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
            {/* Hero Section */}
            <div className="relative w-full h-80 bg-black overflow-hidden flex items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
                    alt="Contact Us"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 text-center text-white p-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Get in Touch</h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                        We'd love to hear from you. Whether you have a question about bookings, feedback, or just want to say hello.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 grow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Have an inquiry or some feedback for us? Fill out the form below to contact our team.
                                For booking support, please include your Booking ID.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
                                <div className="bg-red-100 p-3 rounded-full text-red-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Our Office</h3>
                                    <p className="text-gray-600">123 Cinema Street, Movie City, MC 10101</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Phone Number</h3>
                                    <p className="text-gray-600">+1 (555) 000-0000</p>
                                    <p className="text-gray-500 text-sm mt-1">Mon-Fri 9am-6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition">
                                <div className="bg-green-100 p-3 rounded-full text-green-600">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Email Address</h3>
                                    <p className="text-gray-600">support@cinebook.com</p>
                                    <p className="text-gray-500 text-sm mt-1">We reply within 24 hours</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Message</label>
                                <textarea
                                    rows="4"
                                    placeholder="How can we help you?"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none transition resize-none"
                                ></textarea>
                            </div>

                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-red-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <span>Send Message</span>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};
