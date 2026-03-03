"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '../app/firebase'; // Adjust path if necessary
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Use router for navigation

const ProfilePage = () => {
  const router = useRouter(); // Use router for navigation

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      router.push('/login'); // Redirect to the login page after logout
    } catch (error) {
      console.error('Error logging out:', error); // Log error if there's an issue with logging out
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FFF8EB] text-[#0B1F3A]">
      <h2 className="text-2xl font-bold p-4 bg-white text-center border-b border-[#0B1F3A]/10">PROFILE</h2>
      <div className="p-4">
        <ProfileSection title="User Information">
          <div className="flex items-center mb-4">
            <div className="w-24 h-24 bg-[#EAF0F8] rounded-full mr-4 flex items-center justify-center">
              <i className="fas fa-user text-4xl text-[#0B1F3A]/60"></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Anna Ramanathan</h3>
              <p className="text-[#0B1F3A]/70">+65 67676767</p>
            </div>
          </div>
          <button className="bg-[#FF7A00] text-white px-4 py-2 rounded-full w-full mb-4">
            Change Profile Picture
          </button>
        </ProfileSection>

        <ProfileSection title="Personal Information">
          <InputField label="Birthday" placeholder="Date of Birth" />
          <InputField label="Address" placeholder="Enter address" />
          <InputField label="Email" placeholder="Enter email" />
        </ProfileSection>

        <ProfileSection title="Health Information">
          <InputField label="Medical Conditions" placeholder="Enter medical conditions" />
          <InputField label="Allergies" placeholder="Enter allergies" />
          <InputField label="Medications" placeholder="Enter current medications" />
        </ProfileSection>

        <ProfileSection>
          <ToggleSetting label="Share information with first responders" />
        </ProfileSection>

        <ProfileSection title="Help & Support">
          <button className="w-full text-left py-2">Help Center</button>
          <button className="w-full text-left py-2">Contact Support</button>
        </ProfileSection>

        {/* Logout Button */}
        <button
          className="bg-[#C1121F] text-white px-4 py-2 rounded-full w-full mt-4"
          onClick={handleLogout} // Attach the logout handler
        >
          Logout
        </button>

        <button className="bg-[#0B1F3A] text-white px-4 py-2 rounded-full w-full mt-4">
          Connect to Femina watch
        </button>
      </div>
    </div>
  );
};

// Same as before
const ProfileSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2 text-[#0B1F3A]">{title}</h3>
    <div className="bg-white rounded-lg p-4 shadow border border-[#0B1F3A]/10">{children}</div>
  </div>
);

const InputField = ({ label, placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-[#0B1F3A]/80 mb-1">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full p-2 border border-[#0B1F3A]/20 rounded-md bg-white"
    />
  </div>
);

const ToggleSetting = ({ label }) => (
  <div className="flex items-center justify-between py-2">
    <span>{label}</span>
    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name={label}
        id={label}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
      />
      <label
        htmlFor={label}
        className="toggle-label block overflow-hidden h-6 rounded-full bg-[#0B1F3A]/25 cursor-pointer"
      ></label>
    </div>
  </div>
);

export default ProfilePage;
