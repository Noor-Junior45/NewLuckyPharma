import React from 'react';

const Footer: React.FC = () => {
    const openCookieSettings = (e: React.MouseEvent) => {
        e.preventDefault();
        // Dispatch custom event to open the modal
        window.dispatchEvent(new Event('openConsentModal'));
    };

    return (
        <footer className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800 animate-fade-in" id="main-footer">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-2 font-semibold text-gray-300">&copy; {new Date().getFullYear()} New Lucky Pharma. All rights reserved.</p>
                <p className="text-sm mb-4">Serving the Hanwara community with pride.</p>
                
                <div className="text-xs text-gray-600 flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                    <button 
                        onClick={openCookieSettings}
                        id="btn-cookie-preferences"
                        className="hover:text-emerald-400 transition-colors underline decoration-dotted"
                    >
                        Cookie Preferences
                    </button>
                    <span className="hidden sm:inline text-gray-800">|</span>
                    <span className="text-gray-500 font-mono text-[10px]">Licensed Wholesale Chemist & Drug Wholesaler Enterprise</span>
                </div>

                {/* Legal Statutory Disclaimer as per Indian Drug Laws */}
                <div className="mt-6 pt-6 text-[10px] text-gray-300 max-w-4xl mx-auto text-left leading-relaxed bg-gray-950/40 p-5 rounded-2xl">
                    <span className="font-black text-emerald-400 text-xs tracking-wider uppercase block mb-2.5">STATUTORY MEDICAL DISCLAIMER & INDIAN DRUG COMPLIANCE WARNING:</span>
                    <p className="mb-2">
                        All information, products, chemical compositions, and dosages listed on this website are for general informational, educational, and wholesale catalog tracking purposes only. In strict compliance with the <strong className="text-orange-400 font-bold">Drugs and Cosmetics Act, 1940</strong>, and <strong className="text-orange-400 font-bold">Drugs and Cosmetics Rules, 1945</strong>, New Lucky Pharma operates strictly as a <strong className="text-emerald-400 font-bold">wholesale distributor</strong> and does not recommend, diagnose, prescribe, dispense drugs, or offer private online medical consultations. The supply or wholesale delivery of <strong className="text-orange-400 font-bold">Schedule H, H1, or X drugs</strong> absolutely requires physical verification of a <strong className="text-orange-400 font-bold">valid original medical prescription</strong> issued by a licensed Registered Medical Practitioner (RMP) representing the acquiring druggist/chemist partner.
                    </p>
                    <p>
                        While we make every effort to verify technical catalog information and keep our database accurate, actual product packaging, composition, and physical printed <strong className="text-orange-400 font-bold">Maximum Retail Price (MRP)</strong> are subject to variation per manufacturer batch under the <strong className="text-orange-400 font-bold">Drug Price Control Order (DPCO)</strong>. New Lucky Pharma, its registered pharmacists, wholesale officers, and developers explicitly disclaim any liability for adverse health outcomes, typographical inaccuracies, price fluctuation, or misuse arising from the direct or indirect application of database metrics. Always consult qualified clinical advisors before consuming any medical preparation.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
