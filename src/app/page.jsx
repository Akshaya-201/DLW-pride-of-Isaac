"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ContactsPage from "../components/ContactsPage";
import ProfilePage from "../components/Profilepage";
import SettingsPage from "../components/SettingsPage";
import 'font-awesome/css/font-awesome.min.css';

function MainComponent() {
  const router = useRouter();
  const [emergency, setEmergency] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Emergency alert from Tan Wei Ming", timestamp: "2 mins ago" },
    { id: 2, message: "Location shared with emergency contacts", timestamp: "5 mins ago" },
    { id: 3, message: "Your heart rate is above normal. Please check your health.", timestamp: "10 mins ago" },
    { id: 4, message: "New message from Nur Aisyah", timestamp: "15 mins ago" },
  ]);

  const handleSOS = (source = "sos") => {
    const resolvedSource = typeof source === "string" ? source : "sos";
    setEmergency(true);
    router.push(`/monitor?source=${encodeURIComponent(resolvedSource)}`);
  };

  const handleCameraClick = () => {
    setShowCamera(true);
    // In a real app, you would trigger the device's camera here
    alert("Camera functionality would open here");
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const contacts = [
    { name: "Tan Wei Ming", image: "/imgs/mom.png" },
    { name: "Nur Aisyah", image: "/imgs/dad.png" },
    { name: "Arjun Kumar", image: "/imgs/bro.png" },
    { name: "Priya Nair", image: "/imgs/911.png" },
  ];

  const bottomNav = (
    <div className="flex justify-around items-center p-4 bg-gray-100">
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("home")}>
        <i className="fas fa-home text-orange-400"></i>
        <span className="text-xs text-orange-400">Home</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("myCircle")}>
        <i className="fas fa-users text-gray-600"></i>
        <span className="text-xs">Contacts</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("settings")}>
        <i className="fas fa-cog text-gray-600"></i>
        <span className="text-xs">Settings</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("profile")}>
        <i className="fas fa-user text-gray-600"></i>
        <span className="text-xs">Profile</span>
      </div>
    </div>
  );

  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const favoriteContacts = [
    {
      name: "Tan Wei Ming",
      icon: "fa-phone-alt",
      bg: "bg-red-100",
      textColor: "text-red-500",
    },
    {
      name: "Nur Aisyah",
      icon: "fa-heart",
      bg: "bg-blue-100",
      textColor: "text-blue-500",
    },
    {
      name: "Arjun Kumar",
      icon: "fa-home",
      bg: "bg-green-100",
      textColor: "text-green-500",
    },
    {
      name: "Lim Jia Yi",
      icon: "fa-female",
      bg: "bg-yellow-100",
      textColor: "text-yellow-500",
    },
    {
      name: "Siti Nurul",
      icon: "fa-male",
      bg: "bg-blue-100",
      textColor: "text-blue-500",
    },
  ];

  const allContacts = [
    { name: "Ahmad Firdaus", number: "+65 8777 8899", icon: "fa-star" },
    { name: "Arjun Kumar", number: "+65 8999 0011", icon: "fa-heart" },
    { name: "Chen Wei Jie", number: "+65 8111 2233", icon: "fa-user" },
    { name: "Karthik Rajan", number: "+65 9222 3344", icon: "fa-user-friends" },
    { name: "Lim Jia Yi", number: "+65 8222 3344", icon: "fa-star" },
    { name: "Meera Devi", number: "+65 9333 4455", icon: "fa-user" },
    { name: "Muhammad Iqbal", number: "+65 8888 9900", icon: "fa-heart" },
    { name: "Ng Hui Min", number: "+65 8444 5566", icon: "fa-user-friends" },
    { name: "Nur Aisyah Rahman", number: "+65 8555 6677", icon: "fa-star" },
    { name: "Priya Nair", number: "+65 9111 2233", icon: "fa-user" },
  ];

  const filteredContacts = allContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHomeClick = () => {
    setCurrentPage("home");
    setEmergency(false);
    setProgress(0);
  };

  const renderBottomNav = () => (
    <div className="flex justify-around items-center p-4 bg-[#FFF8EB]/90 backdrop-blur border-t border-[#0B1F3A]/10">
      <div className="flex flex-col items-center" onClick={handleHomeClick}>
        <i className={`fas fa-home ${currentPage === "home" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}></i>
        <span className={`text-xs ${currentPage === "home" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}>Home</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("myCircle")}>
        <i className={`fas fa-users ${currentPage === "myCircle" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}></i>
        <span className={`text-xs ${currentPage === "myCircle" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}>Contacts</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("settings")}>
        <i className={`fas fa-cog ${currentPage === "settings" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}></i>
        <span className={`text-xs ${currentPage === "settings" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}>Settings</span>
      </div>
      <div className="flex flex-col items-center" onClick={() => setCurrentPage("profile")}>
        <i className={`fas fa-user ${currentPage === "profile" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}></i>
        <span className={`text-xs ${currentPage === "profile" ? "text-[#C1121F]" : "text-[#0B1F3A]/70"}`}>Profile</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1F3A] md:flex md:items-center md:justify-center md:p-4">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#0B1F3A] text-[#0B1F3A] md:h-[844px] md:w-[390px] md:max-w-none md:rounded-[28px] md:border md:border-white/30 md:shadow-2xl">
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="flex flex-col min-h-full">
            <div className="flex-1">
              {currentPage === "home" && (
                <div className="h-full">
                  <div className="flex justify-between items-center p-4 bg-white border-b border-[#0B1F3A]/10">
                    <div className="text-[#FF7A00] text-2xl">
                      <i className="fas fa-bolt"></i>
                    </div>
                    <div className="flex space-x-4">
                      <button onClick={handleCameraClick} className="focus:outline-none">
                        <i className="fas fa-camera text-[#0B1F3A]/80 text-xl"></i>
                      </button>
                      <button onClick={handleNotificationClick} className="focus:outline-none relative">
                        <i className="fas fa-bell text-[#0B1F3A]/80 text-xl"></i>
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#C1121F] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {notifications.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {showNotifications && (
                    <div className="absolute right-0 mt-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                        {notifications.map((notification) => (
                          <div key={notification.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 flex flex-col items-center justify-center h-full bg-[#0B1F3A]">
                    {!emergency ? (
                      <>
                        <h2 className="text-2xl font-bold mb-2 text-center text-white">Emergency Situation</h2>
                        <p className="text-white/80 mb-8 text-center max-w-md mx-auto">
                          Tap the SOS button to instantly share your live location authorities and your emergency contacts.
                        </p>
                        <div className="relative mb-12 flex justify-center">
                          <button
                            id="sos-button"
                            onClick={() => handleSOS("sos")}
                            className="w-48 h-48 rounded-full text-white font-bold text-xl shadow-lg relative z-10 bg-[#C1121F] animate-pulse"
                          >
                            <span>SOS</span>
                            <span className="block text-sm">Press 3 seconds</span>
                          </button>
                          <span className="absolute inset-0 rounded-full bg-[#FF7A00]/70 animate-ping"></span>
                          <span className="absolute inset-0 rounded-full bg-[#FF7A00]/70 animate-ping animation-delay-500"></span>
                        </div>
                        <div className="w-full max-w-3xl mt-4 mb-8 rounded-3xl border border-[#0B1F3A]/10 bg-white p-5 shadow-sm">
                          <h3 className="text-xl font-semibold text-gray-900 text-center">What's your emergency?</h3>
                          <p className="text-sm text-gray-500 text-center mt-1 mb-4">
                            Select the category so responders can prioritize help faster.
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { type: "Medical", icon: "fa-heartbeat", hint: "Health issue", cardBg: "bg-[#0B1F3A]", iconBg: "bg-white/20", iconText: "text-white" },
                              { type: "Fire", icon: "fa-fire", hint: "Smoke or flames", cardBg: "bg-[#C1121F]", iconBg: "bg-white/20", iconText: "text-white" },
                              { type: "Other", icon: "fa-exclamation-circle", hint: "Unknown risk", cardBg: "bg-[#FF7A00]", iconBg: "bg-white/20", iconText: "text-white" },
                              { type: "Accident", icon: "fa-car-crash", hint: "Vehicle incident", cardBg: "bg-[#1D3557]", iconBg: "bg-white/20", iconText: "text-white" },
                              { type: "Violence", icon: "fa-fist-raised", hint: "Personal threat", cardBg: "bg-[#9D0208]", iconBg: "bg-white/20", iconText: "text-white" },
                              { type: "Rescue", icon: "fa-life-ring", hint: "Urgent extraction", cardBg: "bg-[#F77F00]", iconBg: "bg-white/20", iconText: "text-white" },
                            ].map((item, index) => (
                              <button
                                key={index}
                                onClick={() => handleSOS(`category:${item.type.toLowerCase()}`)}
                                className={`group relative overflow-hidden rounded-2xl border border-transparent ${item.cardBg} px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-9 h-9 rounded-full ${item.iconBg} ${item.iconText} flex items-center justify-center`}>
                                    <i className={`fas ${item.icon}`}></i>
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-white">{item.type}</span>
                                    <span className="block text-xs text-white/85">{item.hint}</span>
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1F3A]">
                        <h2 className="text-3xl font-bold mb-4 text-center text-white">Calling emergency...</h2>
                        <p className="text-white/80 ml-8 mr-8 mb-8 text-center">
                          Please stand by, we are currently requesting help. Your emergency contacts and nearby rescue services will see your call for help.
                        </p>
                        <div className="relative w-64 h-64">
                          <div className="absolute inset-0 bg-[#FF7A00]/20 rounded-full"></div>
                          <div className="absolute inset-4 bg-[#FF7A00]/30 rounded-full"></div>
                          <div className="absolute inset-8 bg-[#C1121F]/40 rounded-full"></div>
                          <div className="absolute inset-12 bg-[#C1121F] rounded-full flex items-center justify-center">
                            <div className="text-4xl font-bold text-white">{progress}%</div>
                          </div>
                          {contacts.map((contact, index) => (
                            <div key={index} className="absolute w-12 h-12 rounded-full overflow-hidden border-2 border-white" style={{
                              top: `${50 + 40 * Math.sin((index * Math.PI) / 2)}%`,
                              left: `${50 + 40 * Math.cos((index * Math.PI) / 2)}%`,
                              transform: "translate(-50%, -50%)",
                            }}>
                              <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[8px] text-center">
                                {contact.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentPage === "myCircle" && <ContactsPage />}
              {currentPage === "settings" && <SettingsPage />}
              {currentPage === "profile" && <ProfilePage />}
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 left-0 right-0 z-10">
        {renderBottomNav()}
      </div>
      <style jsx global>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #FF7A00;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #C1121F;
        }
      `}</style>
      </div>
    </div>
  );
}

export default MainComponent;
