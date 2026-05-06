'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PresentationSlide = ({ number, title, content, isActive }) => {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ${
        isActive ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* Slide Background */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-12 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <span className="text-blue-600 font-semibold text-lg">Slide {number}/15</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {title}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center my-8">
          {content}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-8 border-t border-blue-200 dark:border-slate-700">
          <span className="text-sm text-slate-600 dark:text-slate-400">Space4Wheels - Intelligent Parking Solution</span>
          <span className="text-sm text-slate-600 dark:text-slate-400">College Project Presentation</span>
        </div>
      </div>
    </div>
  )
}

const slides = [
  {
    title: 'Space4Wheels',
    subtitle: 'Intelligent Parking Management System',
    content: (
      <div className="text-center w-full">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Intelligent Parking Management System
        </h2>
        <div className="space-y-4 text-lg text-slate-700 dark:text-slate-300 mb-8">
          <p><strong>Presented by:</strong> [Your Name]</p>
          <p><strong>College:</strong> [College Name]</p>
          <p><strong>Department:</strong> [Department Name]</p>
          <p><strong>Guide/Mentor:</strong> [Faculty Name]</p>
          <p className="pt-4"><strong>Date:</strong> May 2026</p>
        </div>
        <div className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold">
          Smart Parking, Smart Cities
        </div>
      </div>
    ),
  },
  {
    title: 'Problem Statement',
    content: (
      <div className="space-y-6 w-full">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-l-4 border-red-500">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Current Issues</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>• Time wasted searching for parking</li>
              <li>• No real-time availability information</li>
              <li>• Manual, inefficient booking processes</li>
              <li>• Lack of owner management tools</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-l-4 border-orange-500">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Impact</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>• Traffic congestion increases</li>
              <li>• User frustration & lost time</li>
              <li>• Underutilized parking spaces</li>
              <li>• Revenue loss for owners</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Project Objectives',
    content: (
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">01</div>
            <p className="text-slate-900 dark:text-white font-semibold">Real-time Availability</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Live parking spot status</p>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">02</div>
            <p className="text-slate-900 dark:text-white font-semibold">Easy Booking System</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Seamless user experience</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">03</div>
            <p className="text-slate-900 dark:text-white font-semibold">Owner Dashboard</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Manage parking spaces</p>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">04</div>
            <p className="text-slate-900 dark:text-white font-semibold">Admin Control</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">System oversight</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">05</div>
            <p className="text-slate-900 dark:text-white font-semibold">Location Services</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Google Maps integration</p>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">06</div>
            <p className="text-slate-900 dark:text-white font-semibold">Secure Authentication</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Firebase-based auth</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Existing Systems & Limitations',
    content: (
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Manual Parking</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">Manual search, no coordination</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Phone Booking</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">Time-consuming process</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Limited Info</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">No pricing or availability</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Our Solution</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">Digital, real-time platform</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Instant Booking</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">One-click reservations</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Complete Info</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">Maps, prices, ratings</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Proposed Solution',
    content: (
      <div className="space-y-6 w-full">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Space4Wheels Platform</h3>
          <p className="mb-4">A comprehensive web-based parking management system connecting users, parking owners, and administrators on a single platform.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center border-t-2 border-blue-600">
            <div className="text-3xl font-bold text-blue-600 mb-2">👤</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Users</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Search, book, and manage parking</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center border-t-2 border-indigo-600">
            <div className="text-3xl font-bold text-indigo-600 mb-2">🏢</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Owners</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">List, monitor, and manage spaces</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center border-t-2 border-purple-600">
            <div className="text-3xl font-bold text-purple-600 mb-2">⚙️</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Admin</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Oversee and manage system</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Technology Stack',
    content: (
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg border-b-2 border-blue-600 pb-2">Frontend</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <strong>Next.js 15.3</strong> - React framework
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <strong>React 19</strong> - UI library
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <strong>Tailwind CSS</strong> - Styling
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <strong>Shadcn/ui</strong> - Component library
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg border-b-2 border-indigo-600 pb-2">Backend & Database</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <strong>Firebase</strong> - Database & Auth
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <strong>Next.js API</strong> - Backend routes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <strong>Google Maps API</strong> - Location services
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                <strong>NextAuth.js</strong> - Session management
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'System Architecture',
    content: (
      <div className="space-y-4 w-full">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 dark:bg-blue-900 px-6 py-3 rounded-lg font-bold text-blue-900 dark:text-blue-100">
              Client Layer
            </div>
            <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-blue-400 to-blue-200"></div>
            <div className="text-gray-400">Frontend</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="bg-indigo-100 dark:bg-indigo-900 px-6 py-3 rounded-lg font-bold text-indigo-900 dark:text-indigo-100">
              API Layer
            </div>
            <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-indigo-400 to-indigo-200"></div>
            <div className="text-gray-400">Routes</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="bg-purple-100 dark:bg-purple-900 px-6 py-3 rounded-lg font-bold text-purple-900 dark:text-purple-100">
              Firebase
            </div>
            <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-purple-400 to-purple-200"></div>
            <div className="text-gray-400">Database</div>
          </div>

          <div className="mt-6 bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Key Services:</strong> User authentication, Real-time database, Cloud storage, API endpoints for plots, bookings, users
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Modules & Features',
    content: (
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">User Module</h4>
            <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Authentication & Profile</li>
              <li>• Search nearby parking</li>
              <li>• Book parking spots</li>
              <li>• View bookings & history</li>
              <li>• Manage vehicles</li>
            </ul>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Owner Module</h4>
            <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Dashboard with analytics</li>
              <li>• Add & manage parking plots</li>
              <li>• Monitor availability</li>
              <li>• View booking requests</li>
              <li>• Earnings & reports</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Admin Module</h4>
            <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
              <li>• User management</li>
              <li>• Owner verification</li>
              <li>• System monitoring</li>
              <li>• Dispute resolution</li>
              <li>• Reports & analytics</li>
            </ul>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg border-l-4 border-pink-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Common Features</h4>
            <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Google Maps integration</li>
              <li>• Real-time notifications</li>
              <li>• Rating & reviews</li>
              <li>• Payment processing</li>
              <li>• Dark mode support</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Implementation & Working Process',
    content: (
      <div className="space-y-4 w-full">
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div className="w-0.5 h-16 bg-blue-300"></div>
            </div>
            <div className="pb-8">
              <h4 className="font-bold text-slate-900 dark:text-white">User Registration</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">User signs up with Firebase authentication</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div className="w-0.5 h-16 bg-indigo-300"></div>
            </div>
            <div className="pb-8">
              <h4 className="font-bold text-slate-900 dark:text-white">Search & Browse</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">User searches for parking using location/map</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div className="w-0.5 h-16 bg-purple-300"></div>
            </div>
            <div className="pb-8">
              <h4 className="font-bold text-slate-900 dark:text-white">Select & Book</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">Choose spot, select time, confirm booking</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Confirmation</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">Receive booking confirmation & details</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Screenshots & Demo',
    content: (
      <div className="space-y-4 w-full">
        <p className="text-slate-700 dark:text-slate-300 mb-4">Key interface screens:</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 aspect-video flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">🏠</div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">Landing Page</p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 aspect-video flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">Map & Search</p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 aspect-video flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">Booking Form</p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 aspect-video flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">User Dashboard</p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 aspect-video flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">👨‍💼</div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">Owner Dashboard</p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 aspect-video flex flex-col items-center justify-center">
            <div className="text-4xl mb-2">⚙️</div>
            <p className="text-sm font-bold text-slate-900 dark:text-white text-center">Admin Panel</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Results & Outcomes',
    content: (
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-green-900 dark:text-green-100 mb-3 text-lg">Achievements</h4>
            <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <li>✓ Fully functional multi-role platform</li>
              <li>✓ Real-time booking system</li>
              <li>✓ Integrated Google Maps</li>
              <li>✓ Firebase authentication working</li>
              <li>✓ Responsive design implemented</li>
              <li>✓ Dark mode support</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-lg">Benefits</h4>
            <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
              <li>⚡ Reduces parking search time</li>
              <li>💰 Increases revenue for owners</li>
              <li>📍 Optimizes space utilization</li>
              <li>👥 Improves user experience</li>
              <li>🔒 Secure, scalable platform</li>
              <li>📈 Real-time analytics</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Challenges Faced',
    content: (
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border-l-4 border-orange-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Challenge 1: Real-time Data</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Synchronizing real-time availability across platform</p>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Solution: Firebase Realtime Database</p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border-l-4 border-red-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Challenge 2: Geolocation</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Implementing accurate location-based search</p>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Solution: Google Maps & Geohashing</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border-l-4 border-yellow-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Challenge 3: Payment Integration</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Secure payment processing and verification</p>
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Solution: Payment gateway integration</p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-600">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Challenge 4: Scalability</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Handling concurrent users and bookings</p>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Solution: Cloud architecture & optimization</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Future Enhancements',
    content: (
      <div className="space-y-4 w-full">
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">📱 Mobile App</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Native iOS and Android applications with push notifications</p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">🤖 AI-Powered Features</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Machine learning for demand prediction and dynamic pricing</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">🚗 IoT Integration</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Smart sensors and gates for automated access control</p>
          </div>

          <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-pink-900 dark:text-pink-100 mb-2">💳 Advanced Payments</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Digital wallets, subscriptions, and loyalty programs</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">📊 Advanced Analytics</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">Comprehensive reporting and business intelligence dashboards</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Conclusion',
    content: (
      <div className="space-y-6 w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Project Summary</h3>
          <p className="text-lg leading-relaxed mb-6">
            Space4Wheels is a comprehensive, full-stack web application that revolutionizes urban parking management. By connecting users, parking owners, and administrators on a single platform, we have created an efficient, scalable solution that addresses real-world parking challenges.
          </p>
          <p className="text-lg leading-relaxed">
            The project demonstrates proficiency in modern web technologies including Next.js, React, Firebase, and Google Maps API, combined with proper system design, security practices, and user-centric development.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">3+</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">User Roles</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">30+</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Features</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">100%</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Functional</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Thank You',
    content: (
      <div className="text-center w-full space-y-8">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
          Thank You
        </h2>
        <div className="space-y-4 text-lg text-slate-700 dark:text-slate-300">
          <p><strong>Questions & Discussion</strong></p>
          <p className="text-2xl">❓ 🙋 ❔</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg inline-block">
          <p className="text-slate-900 dark:text-white font-semibold">
            For more information, visit the project repository or contact the development team
          </p>
        </div>
      </div>
    ),
  },
]

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToSlide = (index) => {
    setCurrentSlide(Math.max(0, Math.min(index, slides.length - 1)))
  }

  const goToNextSlide = () => goToSlide(currentSlide + 1)
  const goToPreviousSlide = () => goToSlide(currentSlide - 1)

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') goToNextSlide()
    if (e.key === 'ArrowLeft') goToPreviousSlide()
  }

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide])

  const currentSlideData = slides[currentSlide]

  return (
    <div className="w-full h-screen bg-slate-100 dark:bg-slate-900 flex flex-col" onClick={() => setIsFullscreen(!isFullscreen)}>
      {/* Main Slide Area */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-800">
        <div className="w-full h-full relative">
          {slides.map((slide, index) => (
            <PresentationSlide
              key={index}
              number={index + 1}
              title={slide.title}
              content={slide.content}
              isActive={index === currentSlide}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPreviousSlide()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full p-3 shadow-lg transition-all z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNextSlide()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full p-3 shadow-lg transition-all z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Slide {currentSlide + 1} of {slides.length}
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-blue-600 w-8'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.print()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Print or export as PDF"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}
