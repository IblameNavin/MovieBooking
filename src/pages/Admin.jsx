import React from 'react';
import { Footer } from '../components/Footer';

export const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
            <h2 className="text-xl font-bold mb-2">Total Users</h2>
            <p className="text-4xl font-bold text-blue-600">12,345</p>
            <p className="text-sm text-gray-500 mt-2">+5% from last month</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-600">
            <h2 className="text-xl font-bold mb-2">Total Revenue</h2>
            <p className="text-4xl font-bold text-green-600">$45,678</p>
            <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-600">
            <h2 className="text-xl font-bold mb-2">Active Bookings</h2>
            <p className="text-4xl font-bold text-purple-600">567</p>
            <p className="text-sm text-gray-500 mt-2">Currently active</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold">New User Registration</p>
                <p className="text-sm text-gray-500">John Doe signed up</p>
              </div>
              <span className="text-sm text-gray-400">2 mins ago</span>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold">Booking Confirmed</p>
                <p className="text-sm text-gray-500">Sarah booked "Inception"</p>
              </div>
              <span className="text-sm text-gray-400">15 mins ago</span>
            </div>
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="font-semibold">Support Ticket</p>
                <p className="text-sm text-gray-500">Issue with payment gateway</p>
              </div>
              <span className="text-sm text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
