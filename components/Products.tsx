import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { searchProducts } from '../services/geminiService';
import { ProductCardImage } from './ProductCardImage';
import ProductDetailModal from './ProductDetailModal';
import { productList } from '../data/products';

interface ProductsProps {
    wishlist: number[];
    toggleWishlist: (product: Product) => void;
}

const Products: React.FC<ProductsProps> = ({ wishlist, toggleWishlist }) => {
    // State for Data
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [baseResults, setBaseResults] = useState<Product[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAiResult, setIsAiResult] = useState(false);
    const [sortBy, setSortBy] = useState<string>('default');
    
    // UI states
    const [isFocused, setIsFocused] = useState(false);
    const [showResetToast, setShowResetToast] = useState(false);
    const historyPushedRef = useRef(false);
    
    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // FETCH DATA
    useEffect(() => {
        setLoading(true);
        try {
            let markedData: Product[] = productList.map((p: Product) => ({ ...p, source: 'local' as const }));
            
            // Add Cached AI Products from Search
            try {
                const cachedAiSearches = localStorage.getItem('ai_search_cache');
                if (cachedAiSearches) {
                    const parsedCache = JSON.parse(cachedAiSearches);
                    const aiProducts: Product[] = Object.values(parsedCache).flat() as Product[];
                    const seenIds = new Set(markedData.map((p: Product) => p.id));
                    const uniqueAiProducts: Product[] = [];
                    for (const p of aiProducts) {
                        if (!seenIds.has(p.id)) {
                            seenIds.add(p.id);
                            uniqueAiProducts.push({ ...p, source: 'ai' as const });
                        }
                    }
                    markedData = [...markedData, ...uniqueAiProducts];
                }
            } catch (e) {
                console.error("Failed to load AI cache", e);
            }

            setProducts(markedData);
            setBaseResults(markedData);
            setDisplayedProducts(markedData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Unable to load products. Please try again later.");
            setLoading(false);
        }
    }, []);

    // GESTURE NAVIGATION: Handle Back Button to clear search
    useEffect(() => {
        const handlePopState = (_event: PopStateEvent) => {
            if (hasSearched) {
                // If user uses back gesture while search is active, clear search
                performClear(true); // silent clear (don't push history)
                historyPushedRef.current = false;
            }
        };

        if (hasSearched && !historyPushedRef.current) {
            window.history.pushState({ searchActive: true }, '', window.location.href);
            historyPushedRef.current = true;
            window.addEventListener('popstate', handlePopState);
        } else if (!hasSearched && historyPushedRef.current) {
            window.removeEventListener('popstate', handlePopState);
            historyPushedRef.current = false;
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, [hasSearched]);

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setBaseResults(products);
            applySort(products, sortBy);
            setHasSearched(false);
            setIsAiResult(false);
            setIsSearching(false);
            return;
        }

        setHasSearched(true);
        setIsSearching(true);
        setIsAiResult(false);

        const lowerQuery = query.toLowerCase();
        
        // Local Filter
        let localResults = products.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.description.toLowerCase().includes(lowerQuery) ||
            (p.category && p.category.toLowerCase().includes(lowerQuery))
        );

        // Track Search in Google Analytics (Standard GA4 and custom parameters)
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'search', {
                search_term: query,
                search_type: 'product_catalog',
                results_found_locally: localResults.length > 0
            });
            window.gtag('event', 'product_search', {
                search_query: query,
                local_matches_count: localResults.length,
                fallback_to_ai: localResults.length === 0
            });
        }

        if (localResults.length > 0) {
            setBaseResults(localResults);
            applySort(localResults, sortBy);
            setIsSearching(false);
        } else {
            // Check cache for this specific AI search (optional, as products shouldn't have been loaded previously if localResults length was 0, but good for safety)
            let aiResults: Product[] = [];
            try {
                const cachedAiSearches = localStorage.getItem('ai_search_cache');
                if (cachedAiSearches) {
                    const parsedCache = JSON.parse(cachedAiSearches);
                    if (parsedCache[lowerQuery]) {
                        aiResults = parsedCache[lowerQuery];
                    }
                }
            } catch (e) {}

            if (aiResults.length === 0) {
                // AI Search if local and cache fails
                aiResults = await searchProducts(query);
                
                // Save to cache
                if (aiResults.length > 0) {
                    try {
                        const cachedAiSearches = localStorage.getItem('ai_search_cache');
                        const parsedCache = cachedAiSearches ? JSON.parse(cachedAiSearches) : {};
                        parsedCache[lowerQuery] = aiResults;
                        localStorage.setItem('ai_search_cache', JSON.stringify(parsedCache));
                        
                        // Also append to main products list so it shows in main view later
                        setProducts(prev => {
                            const newProducts = [...prev];
                            const seenIds = new Set(newProducts.map((p: Product) => p.id));
                            aiResults.forEach(p => {
                                if (!seenIds.has(p.id)) {
                                    seenIds.add(p.id);
                                    newProducts.push({ ...p, source: 'ai' as const });
                                }
                            });
                            return newProducts;
                        });
                    } catch (e) {
                        console.error("Failed to save AI cache", e);
                    }
                }
            }

            // We mark as ai result to show the indicator
            setBaseResults(aiResults);
            applySort(aiResults, sortBy);
            setIsAiResult(true);
            setIsSearching(false);
        }
    };

    const applySort = (list: Product[], sortType: string) => {
        let sorted = [...list];
        if (sortType === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'name-desc') {
            sorted.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortType === 'category') {
            sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        }
        setDisplayedProducts(sorted);
    };

    useEffect(() => {
        applySort(baseResults, sortBy);
    }, [sortBy, baseResults]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const inputElement = document.getElementById('product-search-input');
        if (inputElement) inputElement.blur();
        setIsFocused(false);
        await performSearch(searchQuery);
    };

    const performClear = (fromHistory: boolean = false) => {
        setSearchQuery('');
        setDisplayedProducts(products);
        setHasSearched(false);
        setIsAiResult(false);
        setIsSearching(false);
        setIsFocused(false);
        
        // Visual feedback toast
        setShowResetToast(true);
        setTimeout(() => setShowResetToast(false), 2000);
        
        const url = new URL(window.location.href);
        if (url.searchParams.has('search_query')) {
            url.searchParams.delete('search_query');
            window.history.replaceState({}, '', url);
        }

        if (!fromHistory && historyPushedRef.current) {
            historyPushedRef.current = false;
            window.history.back();
        }
    };

    const openQuickView = (product: Product) => {
        setSelectedProduct(product);
        document.body.style.overflow = 'hidden';
    };

    const closeQuickView = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'unset';
    };

    const askAI = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('ask-ai', { 
            detail: { productName: product.name, description: product.description } 
        });
        window.dispatchEvent(event);
    };

    const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleShare = async (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        const isStatic = product.id < 100000;
        const queryParam = isStatic 
            ? `product_id=${product.id}` 
            : `search_query=${encodeURIComponent(product.name)}`;
            
        const shareUrl = `https://newluckypharma.vercel.app/?${queryParam}`;
        const shortText = `Check out ${product.name} at New Lucky Pharma`;
        
        try {
            if (navigator.share) {
                await navigator.share({ title: product.name, text: shortText, url: shareUrl });
            } else {
                await navigator.clipboard.writeText(`${shortText}\n${shareUrl}`);
                setCopiedId(product.id);
                setTimeout(() => setCopiedId(null), 2000);
            }
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    return (
        <section id="products" className="scroll-mt-32 min-h-[800px] transition-all duration-500 relative py-16 bg-gradient-to-br from-medical-100 via-medical-50/80 to-emerald-50" aria-label="Products Section">
            
            {/* Search Reset Toast */}
            <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${showResetToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="bg-medical-800/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs font-black border border-medical-500/30 uppercase tracking-widest">
                    <i className="fas fa-filter-circle-xmark text-medical-300"></i>
                    <span>Search Reset</span>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                
                {/* HEADLINE & DESCRIPTION */}
                <div className="text-center mb-10 reveal">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Popular <span className="text-medical-600">Products & Medicines</span></h2>
                    <p className="text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                        We offer a wide range of pharmaceutical products, from daily essentials to specific treatments.
                    </p>
                </div>

                {/* GOOGLE DESIGN SEARCH BAR */}
                <div className="max-w-2xl mx-auto mb-10 relative z-20 px-2 lg:px-0">
                    <form onSubmit={handleSearch} className="relative group mb-4">
                        <input 
                            id="product-search-input"
                            type="text"
                            enterKeyHint="search"
                            aria-label="Search medicines"
                            value={searchQuery}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search medicines..." 
                            className={`w-full h-12 sm:h-14 bg-white border border-gray-100 rounded-full pl-6 sm:pl-8 pr-16 sm:pr-20 text-gray-700 text-sm sm:text-lg font-normal focus:outline-none transition-all shadow-sm group-hover:shadow-md ${isFocused ? 'shadow-lg border-gray-200' : ''}`}
                        />
                        
                        {/* Buttons inside search bar */}
                        <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searchQuery && (
                                <button 
                                    type="button" 
                                    onClick={() => performClear()}
                                    className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center justify-center"
                                >
                                    <i className="fas fa-times text-md"></i>
                                </button>
                            )}
                            <button 
                                type="submit"
                                onMouseDown={(e) => { e.preventDefault(); handleSearch(); }}
                                className="bg-[#1a9d55] text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-[#168a4a] transition-all active:scale-95 group/search"
                            >
                                {isSearching ? (
                                    <i className="fas fa-spinner fa-spin text-sm sm:text-md"></i>
                                ) : (
                                    <i className="fas fa-search text-sm sm:text-md group-hover/search:scale-110 transition-transform"></i>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* SORTING & FILTERS ROW */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 mb-2">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                <i className="fas fa-sort-amount-down text-medical-500"></i>
                                <span>Sort By:</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                {[
                                    { id: 'name-asc', label: 'A to Z' },
                                    { id: 'name-desc', label: 'Z to A' },
                                    { id: 'category', label: 'Categories' }
                                ].map((option) => (
                                    <button 
                                        key={option.id}
                                        onClick={() => setSortBy(sortBy === option.id ? 'default' : option.id)}
                                        className={`transition-all px-4 py-2 rounded-full border whitespace-nowrap outline-none ${
                                            sortBy === option.id 
                                                ? 'bg-medical-50 text-medical-600 border-medical-200 shadow-sm' 
                                                : 'bg-white text-gray-500 border-gray-100 hover:text-medical-500 hover:border-medical-100'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Result indicator with Google logo */}
                    {hasSearched && isAiResult && (
                        <div className="flex justify-center mt-6 animate-fade-in px-4">
                            <div className="bg-medical-50/80 backdrop-blur-md text-medical-700 px-5 py-2 rounded-full text-[10px] font-black border border-medical-100 shadow-sm flex items-center gap-2 tracking-widest uppercase">
                                <i className="fab fa-google text-blue-500"></i>
                                <span>AI Optimized Results</span>
                            </div>
                        </div>
                    )}
                </div>

                <div id="products-grid-anchor" className="h-1 invisible"></div>

                {/* RESULTS GRID */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-medical-100 border-t-medical-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Pharmacy Data...</p>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-500 ${isSearching ? 'opacity-30 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}>
                        {displayedProducts.length > 0 ? (
                            displayedProducts.map((product, index) => (
                                <div 
                                    key={product.id} 
                                    className="hover-lift-smooth glass-card rounded-3xl overflow-hidden flex flex-col h-full group bg-white relative animate-fade-in-up"
                                    style={{ animationDelay: `${(index % 8) * 100}ms` }}
                                >
                                    <div 
                                        className="h-60 p-8 relative cursor-pointer bg-gradient-to-br from-gray-50 to-white group-hover:from-medical-50/30 transition-colors duration-500 flex items-center justify-center"
                                        onClick={() => openQuickView(product)}
                                    >
                                        <ProductCardImage src={product.image} alt={product.name} />
                                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                            {product.source === 'ai' && (
                                                <div className="bg-medical-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg shadow-lg border border-white/20 mb-1 flex items-center gap-1">
                                                    <i className="fab fa-google text-[10px]"></i> AI Result
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => handleWishlistToggle(e, product)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border ${wishlist.includes(product.id) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white/90 text-gray-300 hover:text-red-500 border-gray-100'}`}
                                            >
                                                <i className={`${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart`}></i>
                                            </button>
                                        </div>
                                        <button
                                            onClick={(e) => handleShare(product, e)}
                                            className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border ${copiedId === product.id ? 'bg-green-100 text-green-600 border-green-200' : 'bg-white/90 text-gray-400 hover:text-blue-500 border-gray-100'}`}
                                        >
                                            <i className={`fas ${copiedId === product.id ? 'fa-check' : 'fa-share-alt'}`}></i>
                                        </button>
                                        <div className="absolute inset-0 bg-medical-900/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                            <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center hover:bg-medical-600 hover:text-white">
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow bg-white relative z-10 border-t border-gray-50">
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {product.category && <span className="text-[10px] font-black text-medical-600 uppercase tracking-widest">{product.category}</span>}
                                                {product.isPrescriptionRequired && <span className="text-[8px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-red-100">Rx Required</span>}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-medical-600 transition-colors">{product.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <button onClick={() => openQuickView(product)} className="text-xs font-black text-medical-700 hover:underline uppercase tracking-widest">Details <i className="fas fa-arrow-right ml-1"></i></button>
                                            <button onClick={(e) => askAI(product, e)} className="w-10 h-10 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center hover:bg-medical-600 hover:text-white transition-all shadow-inner border border-medical-100 group/ai"><i className="fas fa-robot text-sm group-hover/ai:animate-pulse"></i></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center animate-fade-in">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-4xl mb-6 shadow-inner"><i className="fas fa-search-minus"></i></div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No matching products</h3>
                                <p className="text-gray-500 mb-8 max-w-sm text-center">Try searching for generic terms like "Pain relief", "Cough" or "Vitamin".</p>
                                <button onClick={() => performClear()} className="bg-medical-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-medical-500/30 hover:-translate-y-1 transition-all">Show All Products</button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Store Pickup Mode Warning */}
                <div className="mt-12 bg-gradient-to-r from-orange-50/80 to-amber-50/40 border-l-[4px] border-orange-500 rounded-r-xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center sm:items-start relative max-w-2xl mx-auto ring-1 ring-orange-100/50">
                    <div className="text-orange-600 text-2xl shrink-0 p-2 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center">
                        <i className="fas fa-store-slash"></i>
                    </div>
                    <div className="flex-grow pt-0.5 text-center sm:text-left">
                        <h4 className="text-orange-900 text-lg font-bold mb-1 tracking-tight">Store Pickup Only</h4>
                        <p className="text-orange-800/80 text-xs md:text-sm leading-relaxed">
                            We currently <strong className="font-bold text-orange-900">do not offer</strong> home delivery. Please visit our store in Hanwara to purchase medicines. Check availability via WhatsApp.
                        </p>
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={closeQuickView} 
                    isWishlisted={wishlist.includes(selectedProduct.id)}
                    onToggleWishlist={() => toggleWishlist(selectedProduct)}
                    onSwitchProduct={(p) => setSelectedProduct(p)}
                />
            )}
        </section>
    );
};

export default Products;