import React, { useState } from 'react';

const EmergencyContacts: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const contacts = [
        { name: "National Emergency", number: "112", icon: "fa-phone", color: "red" },
        { name: "Ambulance", number: "102", icon: "fa-ambulance", color: "red" },
        { name: "Police", number: "100", icon: "fa-shield-alt", color: "blue" },
        { name: "Health Helpline", number: "104", icon: "fa-notes-medical", color: "green" },
        { name: "Pharmacy (New Lucky Pharma)", number: "+91 97988 81368", icon: "fa-pills", color: "teal" }
    ];

    return (
        <div className="fixed bottom-36 left-4 md:bottom-12 md:left-8 z-50 flex flex-col items-start">
            <div className={`transition-all duration-300 transform origin-bottom-left ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0 overflow-hidden'}`}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 xs:w-80 overflow-hidden">
                    <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-600 font-bold">
                            <i className="fas fa-siren-on animate-pulse"></i> 
                            Emergency Contacts
                        </div>
                        <button onClick={toggleOpen} className="text-red-400 hover:text-red-600 transition-colors">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div className="p-2 max-h-[60vh] overflow-y-auto">
                        {contacts.map((contact, idx) => (
                            <a 
                                key={idx}
                                href={`tel:${contact.number.replace(/\s+/g, '')}`} 
                                className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-100 mb-1"
                            >
                                <div className={`w-10 h-10 rounded-full bg-${contact.color}-100 flex items-center justify-center text-${contact.color}-600 mr-3 group-hover:scale-110 transition-transform`}>
                                    <i className={`fas ${contact.icon}`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800">{contact.name}</p>
                                    <p className="text-xs font-semibold text-gray-500">{contact.number}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                    <i className="fas fa-phone"></i>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={toggleOpen}
                className={`mr-auto flex items-center justify-center space-x-2 bg-red-500/40 hover:bg-red-600/70 backdrop-blur-md border border-red-400/50 text-white rounded-full shadow-lg shadow-red-500/20 transition-all duration-300 ${isOpen ? 'px-4 py-3' : 'w-14 h-14'}`}
                aria-label="Emergency Contacts"
            >
                {isOpen ? (
                    <span className="font-bold whitespace-nowrap">Close</span>
                ) : (
                    <i className="fas fa-truck-medical text-xl animate-pulse"></i>
                )}
            </button>
        </div>
    );
};

export default EmergencyContacts;
