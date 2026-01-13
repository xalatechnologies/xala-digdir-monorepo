import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ListingsPage
 *
 * Main listings page with filters, search, and grid/list/map views.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, FilterIcon, Drawer, DrawerSection, DrawerItem, ContentLayout, ListingCard, ListingListItem, ListingGrid, ListingToolbar, ListingMap, Stack, Text, HeaderSearch, } from '@xala/ds';
import { useUiListings, isUsingMockData } from '@xala/sdk';
import { demoSearchResults, mockListings, listingTypeOptions, capacityOptions } from '../data/mock-data';
// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
// Filter options - listing types with dynamic counts
const getListingTypeCounts = (listingsData) => {
    const counts = { ALL: listingsData.length };
    listingsData.forEach(l => {
        counts[l.listingType] = (counts[l.listingType] || 0) + 1;
    });
    return counts;
};
// Extract unique facilities from listings
const getAllFacilities = (listingsData) => {
    const facilitySet = new Set();
    listingsData.forEach(l => l.facilities?.forEach(f => facilitySet.add(f)));
    return Array.from(facilitySet).sort();
};
// Extract unique areas/locations from listings
const getLocationAreas = () => {
    const areas = [
        { id: 'all', label: 'Alle områder' },
        { id: 'drammen', label: 'Drammen sentrum' },
        { id: 'solbergelva', label: 'Solbergelva' },
        { id: 'gulskogen', label: 'Gulskogen' },
    ];
    return areas;
};
export function ListingsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    // Check if running in mock mode (no license key)
    const isMockMode = isUsingMockData();
    // Fetch listings from API (disabled in mock mode)
    const { data: apiListingsData, isLoading: isApiLoading, error: apiError } = useUiListings({
        status: 'published',
    });
    // Use API data if available, otherwise use mock data as fallback
    const listings = React.useMemo(() => {
        if (!isMockMode && apiListingsData?.data && apiListingsData.data.length > 0) {
            return apiListingsData.data;
        }
        // Use mock data
        return mockListings;
    }, [apiListingsData, isMockMode]);
    // Check if we're actually using API data (for error message display)
    const isUsingApiData = !isMockMode && apiListingsData?.data && apiListingsData.data.length > 0;
    // Filter drawer state
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [listingType, setListingType] = React.useState('ALL');
    const [viewMode, setViewMode] = React.useState('grid');
    // Additional filters
    const [selectedArea, setSelectedArea] = React.useState('all');
    const [selectedCapacity, setSelectedCapacity] = React.useState('all');
    const [selectedFacilities, setSelectedFacilities] = React.useState([]);
    // "Show more" state for filter sections
    const [showMoreType, setShowMoreType] = React.useState(false);
    const [showMoreArea, setShowMoreArea] = React.useState(false);
    const [showMoreCapacity, setShowMoreCapacity] = React.useState(false);
    const [showMoreFacilities, setShowMoreFacilities] = React.useState(false);
    const MAX_VISIBLE_ITEMS = 4;
    // Get filter options
    const typeCounts = React.useMemo(() => getListingTypeCounts(listings), [listings]);
    const allFacilities = React.useMemo(() => getAllFacilities(listings), [listings]);
    const locationAreas = React.useMemo(() => getLocationAreas(), []);
    // Filter listings by all criteria
    const filteredListings = React.useMemo(() => {
        return listings.filter(l => {
            // Filter by listing type
            if (listingType !== 'ALL' && l.listingType !== listingType)
                return false;
            // Filter by area/location
            if (selectedArea !== 'all') {
                const locationLower = l.location.toLowerCase();
                if (selectedArea === 'drammen' && !locationLower.includes('drammen') && !locationLower.includes('storgate') && !locationLower.includes('danvik') && !locationLower.includes('bragernes'))
                    return false;
                if (selectedArea === 'solbergelva' && !locationLower.includes('solbergelva') && !locationLower.includes('solberg'))
                    return false;
                if (selectedArea === 'gulskogen' && !locationLower.includes('gulskogen'))
                    return false;
            }
            // Filter by capacity
            if (selectedCapacity !== 'all') {
                const capacityOption = capacityOptions.find(c => c.id === selectedCapacity);
                if (capacityOption && (l.capacity < capacityOption.min || l.capacity > capacityOption.max))
                    return false;
            }
            // Filter by facilities (all selected must be present)
            if (selectedFacilities.length > 0) {
                const listingFacilities = l.facilities || [];
                if (!selectedFacilities.every(f => listingFacilities.includes(f)))
                    return false;
            }
            return true;
        });
    }, [listings, listingType, selectedArea, selectedCapacity, selectedFacilities]);
    // Pagination - 2 rows at a time (6 items with 3 columns)
    const ITEMS_PER_PAGE = 6;
    const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);
    const visibleListings = filteredListings.slice(0, visibleCount);
    const hasMore = visibleCount < filteredListings.length;
    // Reset visible count when any filter changes
    React.useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [listingType, selectedArea, selectedCapacity, selectedFacilities]);
    // Simulated search function
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        if (!value.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        // Simulate API delay
        setTimeout(() => {
            const query = value.toLowerCase();
            const filtered = demoSearchResults
                .map(group => ({
                ...group,
                items: group.items.filter(item => item.label.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query))
            }))
                .filter(group => group.items.length > 0);
            setSearchResults(filtered);
            setIsSearching(false);
        }, 200);
    };
    const handleSearch = (value) => {
        console.log('Searching for:', value);
    };
    const handleResultSelect = (result) => {
        console.log('Selected result:', result);
        setSearchQuery('');
        setSearchResults([]);
    };
    const handleTypeSelect = (typeId) => {
        setListingType(typeId);
    };
    const handleListingClick = (id) => {
        navigate(`/listing/${id}`);
    };
    const activeFilterCount = (listingType !== 'ALL' ? 1 : 0) +
        (selectedArea !== 'all' ? 1 : 0) +
        (selectedCapacity !== 'all' ? 1 : 0) +
        selectedFacilities.length;
    return (_jsxs(_Fragment, { children: [_jsxs(Drawer, { isOpen: isFilterOpen, onClose: () => setIsFilterOpen(false), title: "Filtre", icon: _jsx(FilterIcon, { size: 20 }), position: "left", size: "sm", mobilePosition: "bottom", mobileSize: "lg", footer: _jsxs(Stack, { spacing: "var(--ds-spacing-3)", children: [_jsxs(Text, { size: "sm", color: "var(--ds-color-neutral-text-subtle)", style: { textAlign: 'center' }, children: ["Viser ", filteredListings.length, " resultater"] }), _jsx(Button, { type: "button", variant: "primary", style: { width: '100%' }, onClick: () => setIsFilterOpen(false), children: "Vis resultater" })] }), children: [_jsx(DrawerSection, { title: "Type", collapsible: true, children: _jsxs(Stack, { spacing: "var(--ds-spacing-1)", children: [(showMoreType ? listingTypeOptions : listingTypeOptions.slice(0, MAX_VISIBLE_ITEMS)).map((type, index) => (_jsx("div", { style: {
                                        animation: 'filterItemFadeIn 0.2s ease-out forwards',
                                        animationDelay: `${index * 0.03}s`,
                                        opacity: 0,
                                    }, children: _jsx(DrawerItem, { left: _jsx(Checkbox, { checked: listingType === type.id, onChange: () => handleTypeSelect(type.id), "aria-label": type.label }), right: _jsxs(Text, { size: "sm", children: ["(", typeCounts[type.id] || 0, ")"] }), onClick: () => handleTypeSelect(type.id), selected: listingType === type.id, children: _jsx(Text, { size: "sm", color: "var(--ds-color-neutral-text-default)", children: type.label }) }) }, type.id))), listingTypeOptions.length > MAX_VISIBLE_ITEMS && (_jsx(Button, { type: "button", variant: "tertiary", style: {
                                        marginTop: 'var(--ds-spacing-2)',
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                    }, onClick: () => setShowMoreType(!showMoreType), children: showMoreType ? 'Vis mindre' : `Vis ${listingTypeOptions.length - MAX_VISIBLE_ITEMS} flere` }))] }) }), _jsx(DrawerSection, { title: "Omr\u00E5de", collapsible: true, defaultCollapsed: true, children: _jsxs(Stack, { spacing: "var(--ds-spacing-1)", children: [(showMoreArea ? locationAreas : locationAreas.slice(0, MAX_VISIBLE_ITEMS)).map((area, index) => (_jsx("div", { style: {
                                        animation: 'filterItemFadeIn 0.2s ease-out forwards',
                                        animationDelay: `${index * 0.03}s`,
                                        opacity: 0,
                                    }, children: _jsx(DrawerItem, { left: _jsx(Checkbox, { checked: selectedArea === area.id, onChange: () => setSelectedArea(area.id), "aria-label": area.label }), onClick: () => setSelectedArea(area.id), selected: selectedArea === area.id, children: _jsx(Text, { size: "sm", color: "var(--ds-color-neutral-text-default)", children: area.label }) }) }, area.id))), locationAreas.length > MAX_VISIBLE_ITEMS && (_jsx(Button, { type: "button", variant: "tertiary", style: {
                                        marginTop: 'var(--ds-spacing-2)',
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                    }, onClick: () => setShowMoreArea(!showMoreArea), children: showMoreArea ? 'Vis mindre' : `Vis ${locationAreas.length - MAX_VISIBLE_ITEMS} flere` }))] }) }), _jsx(DrawerSection, { title: "Kapasitet", collapsible: true, defaultCollapsed: true, children: _jsxs(Stack, { spacing: "var(--ds-spacing-1)", children: [(showMoreCapacity ? capacityOptions : capacityOptions.slice(0, MAX_VISIBLE_ITEMS)).map((cap, index) => (_jsx("div", { style: {
                                        animation: 'filterItemFadeIn 0.2s ease-out forwards',
                                        animationDelay: `${index * 0.03}s`,
                                        opacity: 0,
                                    }, children: _jsx(DrawerItem, { left: _jsx(Checkbox, { checked: selectedCapacity === cap.id, onChange: () => setSelectedCapacity(cap.id), "aria-label": cap.label }), onClick: () => setSelectedCapacity(cap.id), selected: selectedCapacity === cap.id, children: _jsx(Text, { size: "sm", color: "var(--ds-color-neutral-text-default)", children: cap.label }) }) }, cap.id))), capacityOptions.length > MAX_VISIBLE_ITEMS && (_jsx(Button, { type: "button", variant: "tertiary", style: {
                                        marginTop: 'var(--ds-spacing-2)',
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                    }, onClick: () => setShowMoreCapacity(!showMoreCapacity), children: showMoreCapacity ? 'Vis mindre' : `Vis ${capacityOptions.length - MAX_VISIBLE_ITEMS} flere` }))] }) }), _jsx(DrawerSection, { title: "Fasiliteter", collapsible: true, defaultCollapsed: true, children: _jsxs(Stack, { spacing: "var(--ds-spacing-1)", children: [(showMoreFacilities ? allFacilities : allFacilities.slice(0, MAX_VISIBLE_ITEMS)).map((facility, index) => (_jsx("div", { style: {
                                        animation: 'filterItemFadeIn 0.2s ease-out forwards',
                                        animationDelay: `${index * 0.03}s`,
                                        opacity: 0,
                                    }, children: _jsx(DrawerItem, { left: _jsx(Checkbox, { checked: selectedFacilities.includes(facility), onChange: () => {
                                                setSelectedFacilities(prev => prev.includes(facility)
                                                    ? prev.filter(f => f !== facility)
                                                    : [...prev, facility]);
                                            }, "aria-label": facility }), onClick: () => {
                                            setSelectedFacilities(prev => prev.includes(facility)
                                                ? prev.filter(f => f !== facility)
                                                : [...prev, facility]);
                                        }, selected: selectedFacilities.includes(facility), children: _jsx(Text, { size: "sm", color: "var(--ds-color-neutral-text-default)", children: facility }) }) }, facility))), allFacilities.length > MAX_VISIBLE_ITEMS && (_jsx(Button, { type: "button", variant: "tertiary", style: {
                                        marginTop: 'var(--ds-spacing-2)',
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                    }, onClick: () => setShowMoreFacilities(!showMoreFacilities), children: showMoreFacilities ? 'Vis mindre' : `Vis ${allFacilities.length - MAX_VISIBLE_ITEMS} flere` }))] }) })] }), _jsx(ContentLayout, { maxWidth: "1440px", className: "main-content-layout", children: _jsxs("main", { id: "main", style: { paddingTop: 'var(--ds-spacing-6)', paddingBottom: 'var(--ds-spacing-6)' }, children: [_jsx("div", { className: "mobile-search-wrapper", style: { marginBottom: 'var(--ds-spacing-4)' }, children: _jsx(HeaderSearch, { placeholder: "S\u00F8k lokaler...", value: searchQuery, onSearchChange: handleSearchChange, onSearch: handleSearch, results: searchResults, onResultSelect: handleResultSelect, isLoading: isSearching }) }), !isMockMode && isApiLoading && (_jsx("div", { style: {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 'var(--ds-spacing-8)',
                                color: 'var(--ds-color-neutral-text-subtle)'
                            }, children: _jsx(Text, { size: "md", children: "Laster lokaler..." }) })), !isMockMode && apiError && !isApiLoading && !isUsingApiData && (_jsx("div", { style: {
                                padding: 'var(--ds-spacing-4)',
                                marginBottom: 'var(--ds-spacing-4)',
                                backgroundColor: 'var(--ds-color-warning-background-subtle)',
                                borderRadius: 'var(--ds-border-radius-md)',
                                border: '1px solid var(--ds-color-warning-border-subtle)'
                            }, children: _jsx(Text, { size: "sm", color: "var(--ds-color-warning-text-default)", children: "Kunne ikke laste data fra API. Viser demo-data." }) })), isMockMode && import.meta.env.DEV && (_jsx("div", { style: {
                                padding: 'var(--ds-spacing-3)',
                                marginBottom: 'var(--ds-spacing-4)',
                                backgroundColor: 'var(--ds-color-info-background-subtle)',
                                borderRadius: 'var(--ds-border-radius-md)',
                                border: '1px solid var(--ds-color-info-border-subtle)'
                            }, children: _jsx(Text, { size: "sm", color: "var(--ds-color-info-text-default)", children: "Demo-modus: Viser eksempeldata. Legg til VITE_LICENSE_KEY for \u00E5 koble til API." }) })), _jsx(ListingToolbar, { count: filteredListings.length, countLabel: "resultater", activeFilterCount: activeFilterCount, onFilterClick: () => setIsFilterOpen(true), viewMode: viewMode, onViewModeChange: setViewMode, showViewToggle: true, className: "listing-toolbar" }), viewMode === 'grid' ? (_jsx(ListingGrid, { minCardWidth: 300, children: visibleListings.map((listing) => (_jsx(ListingCard, { id: listing.id, name: listing.name, type: listing.type, listingType: listing.listingType, location: listing.location, description: listing.description, image: listing.image, facilities: listing.facilities, moreFacilities: listing.moreFacilities, capacity: listing.capacity, price: listing.price, priceUnit: listing.priceUnit, available: listing.available, showRating: false, showPrice: false, showListingType: true, onClick: handleListingClick, onFavorite: (id) => console.log('Toggle favorite:', id), onShare: (id) => console.log('Share listing:', id) }, listing.id))) })) : viewMode === 'list' ? (_jsx(Stack, { spacing: "var(--ds-spacing-4)", children: visibleListings.map((listing) => (_jsx(ListingListItem, { id: listing.id, name: listing.name, type: listing.type, listingType: listing.listingType, location: listing.location, description: listing.description, image: listing.image, facilities: listing.facilities, moreFacilities: listing.moreFacilities, capacity: listing.capacity, ...(listing.latitude !== undefined && { latitude: listing.latitude }), ...(listing.longitude !== undefined && { longitude: listing.longitude }), mapboxToken: MAPBOX_TOKEN, showListingType: true, showMap: Boolean(listing.latitude && listing.longitude), onClick: handleListingClick, onFavorite: (id) => console.log('Toggle favorite:', id) }, listing.id))) })) : (_jsx(ListingMap, { listings: listings
                                .filter(l => l.latitude && l.longitude)
                                .map(l => ({
                                id: l.id,
                                name: l.name,
                                location: l.location,
                                image: l.image,
                                latitude: l.latitude,
                                longitude: l.longitude,
                                type: l.type,
                                listingType: l.listingType,
                                description: l.description,
                                capacity: l.capacity,
                                price: l.price,
                                priceUnit: l.priceUnit,
                                facilities: l.facilities,
                                available: l.available,
                            })), mapboxToken: MAPBOX_TOKEN, height: "calc(100vh - 250px)", onListingClick: handleListingClick })), viewMode !== 'map' && hasMore && (_jsx("div", { style: {
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: 'var(--ds-spacing-8)'
                            }, children: _jsxs(Button, { type: "button", variant: "secondary", onClick: () => setVisibleCount(prev => prev + ITEMS_PER_PAGE), style: { paddingInline: 'var(--ds-spacing-8)' }, children: ["Vis flere (", filteredListings.length - visibleCount, " igjen)"] }) }))] }) }), _jsx("style", { children: `
        @keyframes filterItemFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` })] }));
}
export default ListingsPage;
