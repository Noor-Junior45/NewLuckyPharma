import React, { useState, useEffect } from 'react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const FAQ: React.FC = () => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const faqs: FAQItem[] = [
        {
            id: "prescriptions",
            question: "Do I need a prescription to buy medicines?",
            answer: "Yes, for Schedule H and H1 drugs (like antibiotics, sleeping pills, etc.), a valid prescription from a registered medical practitioner is mandatory. However, general OTC (Over-the-Counter) products like vitamins, pain balms, and supplements can be purchased without one."
        },
        {
            id: "store-timings",
            question: "What are your store timings?",
            answer: "We are open 7 days a week from 6:00 AM to 9:00 PM. On Fridays, we observe a break from 12:00 PM to 2:00 PM for holy prayers block. We remain open on most public holidays to serve emergency needs."
        },
        {
            id: "home-delivery",
            question: "Do you offer home delivery?",
            answer: "Currently, we do not offer home delivery services. We request our customers to visit the store personally for their requirements. You can, however, call or WhatsApp us to confirm product availability before your visit."
        },
        {
            id: "payment-methods",
            question: "What payment methods do you accept?",
            answer: "We accept Cash and all major UPI apps including PhonePe, Google Pay, and Paytm. We are currently working on enabling credit/debit card swipe machines for your convenience."
        },
        {
            id: "return-policy",
            question: "What is your return and refund policy?",
            answer: "At New Lucky Pharma, we adhere to strict pharmaceutical storage, cold chain, and safety standards. Therefore, we do *not* accept any returns, exchanges, or refunds for medicines, baby foods, surgicals, or wellness products once they have left our pharmacy premises. This non-returnable policy ensures that every medicine supplied is 100% genuine, untampered, and fully sterile. Please double-check your prescription orders at our counter before payment."
        },
        {
            id: "authentic-medicines",
            question: "Are your medicines authentic?",
            answer: "Absolutely. We source all our medicines directly from authorized stockists and manufacturers. We guarantee 100% genuine and high-quality pharmaceutical products."
        },
        {
            id: "pharmacist-consultation",
            question: "Do you have a pharmacist available for consultation?",
            answer: "Yes, we have experienced pharmacists available at the store during working hours to guide you on dosage, side effects, and general health advice."
        },
        {
            id: "bulk-orders",
            question: "Can I place a bulk order for my clinic?",
            answer: "Yes, we accept bulk orders for clinics and nursing homes. Please contact us directly via phone or WhatsApp to discuss pricing and availability."
        }
    ];

    useEffect(() => {
        const handleHashOrQuery = () => {
            const hash = window.location.hash.toLowerCase().replace('#', '');
            
            // Also check query param (?faq=...)
            const params = new URLSearchParams(window.location.search);
            const queryFaq = params.get('faq')?.toLowerCase();
            
            const targetId = hash || queryFaq;

            if (targetId) {
                const foundIndex = faqs.findIndex(f => f.id.toLowerCase() === targetId);
                if (foundIndex !== -1) {
                    // Open the FAQ item
                    setOpenIndices(prev => prev.includes(foundIndex) ? prev : [...prev, foundIndex]);
                    
                    // Smooth scroll to the element
                    setTimeout(() => {
                        const element = document.getElementById(`faq-item-${faqs[foundIndex].id}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // Visual flash effect
                            element.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-50/20');
                            setTimeout(() => {
                                element.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50/20');
                            }, 3000);
                        }
                    }, 300);
                }
            }
        };

        // Run on mount
        handleHashOrQuery();

        // Listen to hash changes
        window.addEventListener('hashchange', handleHashOrQuery);
        return () => {
            window.removeEventListener('hashchange', handleHashOrQuery);
        };
    }, []);

    const toggleFAQ = (index: number) => {
        setOpenIndices(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index) 
                : [...prev, index]
        );
    };

    const copyDirectLink = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
        e.stopPropagation(); // prevent collapsing/expanding the accordion
        if ('preventDefault' in e) {
            e.preventDefault();
        }
        const baseUrl = window.location.origin + window.location.pathname;
        const linkUrl = `${baseUrl}#${id}`;
        
        navigator.clipboard.writeText(linkUrl).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <section id="faq" className="py-16 scroll-mt-24 bg-gradient-to-b from-white via-medical-100/50 to-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12 reveal">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/60 backdrop-blur-md text-medical-800 text-sm font-semibold mb-3 shadow-sm border border-white/50">
                        <i className="fas fa-question-circle mr-1"></i> Help Center & Policies
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">Frequently Asked Questions</h2>
                    <p className="text-gray-700 font-medium">Find answers to common questions about our refund policy, store timings, and pharmacy services.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndices.includes(index);
                        const isCopied = copiedId === faq.id;
                        return (
                            <div 
                                key={faq.id} 
                                id={`faq-item-${faq.id}`}
                                className={`glass-card rounded-2xl transition-all duration-300 border border-gray-100/60 ${
                                    isOpen 
                                        ? 'shadow-lg ring-1 ring-medical-200/50 bg-white' 
                                        : 'shadow-sm hover:shadow-md bg-white/60'
                                }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer select-none group"
                                    aria-expanded={isOpen}
                                >
                                    <span className={`font-bold text-lg pr-4 transition-colors duration-300 ${isOpen ? 'text-medical-700' : 'text-gray-800 group-hover:text-medical-600'}`}>
                                        {faq.question}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {/* Direct Link Share Button */}
                                        <span
                                            onClick={(e) => copyDirectLink(e, faq.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    copyDirectLink(e, faq.id);
                                                }
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            title="Copy direct link to this FAQ"
                                            className={`relative p-2 rounded-full border text-xs flex items-center justify-center gap-1 transition-all ${
                                                isCopied 
                                                    ? 'bg-emerald-500 text-white border-emerald-500' 
                                                    : 'bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 border-gray-200'
                                            }`}
                                        >
                                            {isCopied ? (
                                                <>
                                                    <i className="fas fa-check"></i>
                                                    <span className="text-[10px] uppercase font-bold pr-1">Copied</span>
                                                </>
                                            ) : (
                                                <i className="fas fa-link"></i>
                                            )}
                                        </span>

                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-medical-100 text-medical-600 rotate-180' : 'bg-white text-gray-400 group-hover:bg-medical-50'}`}>
                                            <i className="fas fa-chevron-down text-sm"></i>
                                        </div>
                                    </div>
                                </button>
                                
                                {isOpen && (
                                    <div className="animate-fade-in">
                                        <div className="p-5 pt-0 text-gray-700 border-t border-gray-100 leading-relaxed font-medium">
                                            {faq.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQ;