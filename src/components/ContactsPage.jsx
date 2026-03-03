import React, { useState } from 'react';

const favoriteContacts = [
  { name: "Mom", number: "+65 8123 4567", icon: "fa-heart", bg: "bg-[#FFE6E8]", textColor: "text-[#C1121F]" },
  { name: "Dad", number: "+65 9234 5678", icon: "fa-home", bg: "bg-[#FFECD8]", textColor: "text-[#FF7A00]" },
  { name: "Brother", number: "+65 9345 6789", icon: "fa-phone-alt", bg: "bg-[#EAF0F8]", textColor: "text-[#0B1F3A]" },
  { name: "Lim Jia Yi", number: "+65 8456 7890", icon: "fa-female", bg: "bg-[#FFECD8]", textColor: "text-[#FF7A00]" },
  { name: "Siti Nurul", number: "+65 9567 8901", icon: "fa-male", bg: "bg-[#EAF0F8]", textColor: "text-[#0B1F3A]" },
];

const allContacts = [
  { name: "Mom", number: "+65 8777 8899" },
  { name: "Dad", number: "+65 8999 0011" },
  { name: "Brother", number: "+65 8111 2233" },
  { name: "Karthik Rajan", number: "+65 9222 3344" },
  { name: "Lim Jia Yi", number: "+65 8222 3344" },
  { name: "Meera Devi", number: "+65 9333 4455" },
  { name: "Muhammad Iqbal", number: "+65 8888 9900" },
  { name: "Ng Hui Min", number: "+65 8444 5566" },
  { name: "Nur Aisyah Rahman", number: "+65 8555 6677" },
  { name: "Priya Nair", number: "+65 9111 2233" },
  { name: "Siti Nurul Huda", number: "+65 8666 7788" },
  { name: "Tan Wei Ming", number: "+65 8333 4455" },
];

const ContactsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = allContacts
    .filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const letter = contact.name.charAt(0).toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(contact);
    return groups;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto bg-[#FFF8EB]">
      <div className="sticky top-0 z-10 bg-[#FFF8EB] px-4 pt-5 pb-4 border-b border-[#0B1F3A]/10">
        <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A]">Contacts</h2>
        <div className="relative mt-4">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1F3A]/40"></i>
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-xl border border-[#0B1F3A]/15 bg-white py-3 pl-11 pr-4 text-base text-[#0B1F3A] outline-none focus:ring-2 focus:ring-[#FF7A00]/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#0B1F3A]/60 mb-3">Favorites</h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {favoriteContacts.map((contact, index) => (
            <div
              key={index}
              className="min-w-[72px] flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full ${contact.bg} ${contact.textColor} flex items-center justify-center`}>
                <i className={`fas ${contact.icon} text-xl`}></i>
              </div>
              <span className="mt-2 text-xs font-semibold text-[#0B1F3A]">{contact.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-[#0B1F3A]/10">
        {Object.keys(groupedContacts).length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#0B1F3A]/60">No contacts found</p>
        )}

        {Object.entries(groupedContacts).map(([letter, contacts]) => (
          <div key={letter}>
            <div className="px-4 py-2 text-xs font-semibold text-[#0B1F3A]/60 bg-[#FFF8EB] border-y border-[#0B1F3A]/10">
              {letter}
            </div>

            {contacts.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center justify-between px-4 py-3 border-b border-[#0B1F3A]/10"
              >
                <div className="flex items-center min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#EAF0F8] text-[#0B1F3A] flex items-center justify-center font-semibold">
                    {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="ml-3 min-w-0">
                    <h4 className="font-medium text-[#0B1F3A] truncate">{contact.name}</h4>
                    <p className="text-sm text-[#0B1F3A]/60 truncate">{contact.number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <button className="w-9 h-9 rounded-full bg-[#C1121F] text-white">
                    <i className="fas fa-phone text-sm"></i>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-[#FF7A00] text-white">
                    <i className="fas fa-comment text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsPage;
