'use client';

import { useDosingGuide } from '@/contexts/DosingGuideContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaArrowRight } from 'react-icons/fa';

export default function Sidebar() {
  const { allPharmacies, error } = useDosingGuide();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isScrollingRef = useRef(false);

  // Scroll spy functionality
  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll spy if we're programmatically scrolling
      if (isScrollingRef.current) return;

      // Get the scrollable container (the children div in layout)
      // const scrollContainer = document.querySelector('.lg\\:tw-col-span-9.lg\\:tw-overflow-y-auto');

      // Get all section elements
      const sections = document.querySelectorAll('[id^="category-"], #evaluate-side-effects');

      let currentSection: string | null = null;

      // Find which section is currently in view
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Check if section is in the upper portion of the viewport
        if (rect.top <= window.innerHeight / 3 && rect.bottom >= 0) {
          const sectionId = section.getAttribute('id');
          if (sectionId) {
            currentSection = sectionId;
          }
        }
      });

      // Map section ID back to category name
      if (!currentSection) return;

      if (currentSection === 'evaluate-side-effects') {
        setActiveCategory('Evaluate side effects');
        return;
      }

      // Find the matching category from the pharmacy data
      const currentPharmacy = allPharmacies.find((p) => pathname === `/dosing-guide/${p.slug}`);

      if (!currentPharmacy) return;

      const sectionIndex = parseInt((currentSection as string).replace('category-', ''));
      const isNorthwestOr1stChoice = pathname === '/dosing-guide/northwest' || pathname === '/dosing-guide/1st-choice';

      if (isNorthwestOr1stChoice) {
        // For Northwest and 1st Choice
        const uniqueCategories = Array.from(
          new Set(currentPharmacy.categoryGroups.filter((cg) => cg.group !== 'Standard').map((cg) => cg.category))
        );
        if (uniqueCategories[sectionIndex]) {
          setActiveCategory(uniqueCategories[sectionIndex]);
        }
      } else {
        // For other pages
        const filteredGroups = currentPharmacy.categoryGroups.filter((cg) => cg.group !== 'Standard');
        if (filteredGroups[sectionIndex]) {
          setActiveCategory(filteredGroups[sectionIndex].name);
        }
      }
    };

    // Get the scrollable container
    const scrollContainer = document.querySelector('.lg\\:tw-col-span-9.lg\\:tw-overflow-y-auto');

    // Add scroll event listener to both window (for mobile) and container (for desktop)
    window.addEventListener('scroll', handleScroll);
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    // Call once on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pathname, allPharmacies]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='lg:tw-hidden tw-fixed tw-top-[70px] md:tw-top-20 md:tw-left-10 tw-left-4 tw-z-50 tw-p-1.5 tw-bg-blue-600 tw-text-white tw-rounded-lg tw-shadow-lg hover:tw-bg-blue-700 tw-transition-colors'
        aria-label='Toggle menu'
      >
        {isOpen ? (
          <svg className='md:tw-w-5 md:tw-h-5 tw-w-4 tw-h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        ) : (
          <svg className='md:tw-w-5 md:tw-h-5 tw-w-4 tw-h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className='lg:tw-hidden tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-40'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          tw-w-64 lg:tw-w-full tw-bg-[#FFFDF6] tw-border-r tw-border-gray-200 tw-min-h-screen lg:tw-min-h-full tw-p-4 tw-pl-6 lg:tw-pl-12 xl:tw-pl-20
          tw-fixed lg:tw-sticky lg:tw-top-0 tw-top-0 tw-left-0 tw-z-50
          tw-transition-transform tw-duration-300 tw-ease-in-out
          tw-shadow-xl lg:tw-shadow-none
          ${isOpen ? 'tw-translate-x-0' : '-tw-translate-x-full lg:tw-translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className='lg:tw-hidden tw-absolute tw-top-4 tw-right-4 tw-p-2 tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors'
          aria-label='Close menu'
        >
          <svg className='tw-w-6 tw-h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <h1 className='tw-text-2xl tw-font-bold tw-mb-2'>Dosing Guide</h1>
        <p className='tw-text-base tw-font-normal tw-text-black tw-mb-6'>List of Pharmacies</p>

        {error && (
          <div className='tw-mb-4 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded tw-text-sm tw-text-red-700'>
            Error loading pharmacies
          </div>
        )}

        {/* Display pharmacy names with their category-group combinations */}
        <div className='tw-space-y-4'>
          {allPharmacies.map((pharmacy) => {
            const isActive = pathname === `/dosing-guide/${pharmacy.slug}`;

            return (
              <div key={pharmacy.slug} className='tw-p-0 tw-pl-0'>
                <Link
                  href={`/dosing-guide/${pharmacy.slug}`}
                  className='tw-flex tw-items-center tw-justify-between tw-cursor-pointer tw-no-underline'
                  onClick={() => setIsOpen(false)}
                >
                  <p
                    className={`tw-text-xs tw-capitalize tw-mb-2 ${
                      isActive ? 'tw-text-[#3060FE] tw-font-bold' : 'tw-text-gray-500 tw-font-normal'
                    }`}
                  >
                    {pharmacy.name}
                  </p>
                  <FaArrowRight className={`${isActive ? 'tw-text-[#3060FE]' : 'tw-text-gray-500'} -tw-rotate-45`} />
                </Link>
                {isActive && (
                  <div className='tw-pl-0'>
                    <ul className='tw-space-y-1 tw-list-none tw-p-0 tw-m-0'>
                      {(() => {
                        const isNorthwestOr1stChoice =
                          pathname === '/dosing-guide/northwest' || pathname === '/dosing-guide/1st-choice';

                        if (isNorthwestOr1stChoice) {
                          // For Northwest and 1st Choice, group by category and show only unique categories
                          const uniqueCategories = Array.from(
                            new Set(
                              pharmacy.categoryGroups
                                .filter((categoryGroup) => categoryGroup.group !== 'Standard')
                                .map((categoryGroup) => categoryGroup.category)
                            )
                          );

                          return uniqueCategories.map((category, categoryIndex) => {
                            const isCategoryActive = activeCategory === category;

                            return (
                              <li
                                key={categoryIndex}
                                className='tw-flex tw-items-center tw-cursor-pointer tw-py-1 tw-px-3 tw-rounded tw-mr-2 tw-mb-2'
                                onClick={() => {
                                  const wasActive = isCategoryActive;
                                  setActiveCategory(isCategoryActive ? null : category);
                                  setIsOpen(false);

                                  // Disable scroll spy during programmatic scroll
                                  isScrollingRef.current = true;

                                  // If category was active and is being deactivated, scroll to top
                                  if (wasActive) {
                                    setTimeout(() => {
                                      window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                      });
                                      // Re-enable scroll spy after scroll completes
                                      setTimeout(() => {
                                        isScrollingRef.current = false;
                                      }, 800);
                                    }, 100);
                                    return;
                                  }

                                  // Otherwise, scroll to the respective section
                                  const sectionId =
                                    category === 'Evaluate side effects'
                                      ? 'evaluate-side-effects'
                                      : `category-${categoryIndex}`;

                                  setTimeout(() => {
                                    const element = document.getElementById(sectionId);
                                    if (element) {
                                      element.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                      });
                                      // Re-enable scroll spy after scroll completes
                                      setTimeout(() => {
                                        isScrollingRef.current = false;
                                      }, 800);
                                    }
                                  }, 100);
                                }}
                              >
                                {isCategoryActive && (
                                  <div className='tw-w-2 tw-h-2 tw-bg-[#3060FE] tw-rounded-full tw-mr-2 tw-flex-shrink-0 tw-animate-pulse'></div>
                                )}
                                <span
                                  className={`tw-text-xs ${
                                    isCategoryActive ? 'tw-text-xs tw-font-normal' : 'tw-text-gray-500 tw-font-normal'
                                  }`}
                                >
                                  {category}
                                </span>
                              </li>
                            );
                          });
                        } else {
                          // For other pages, show category groups as before
                          return pharmacy.categoryGroups
                            .filter((categoryGroup) => categoryGroup.group !== 'Standard')
                            .map((categoryGroup, groupIndex) => {
                              const isCategoryActive = activeCategory === categoryGroup.name;

                              // Special handling for "Evaluate side effects" - show only category name
                              let displayName =
                                categoryGroup.category === 'Evaluate side effects'
                                  ? categoryGroup.category
                                  : categoryGroup.name;

                              // For Olympia and MFV, remove brackets around group
                              if (pathname === '/dosing-guide/olympia' || pathname === '/dosing-guide/mfv') {
                                displayName = displayName.replace(/\(([^)]+)\)$/, '$1');
                              }

                              return (
                                <li
                                  key={groupIndex}
                                  className='tw-flex tw-items-center tw-cursor-pointer tw-py-1 tw-px-3 tw-rounded tw-mr-2 tw-mb-2'
                                  onClick={() => {
                                    const wasActive = isCategoryActive;
                                    setActiveCategory(isCategoryActive ? null : categoryGroup.name);
                                    setIsOpen(false);

                                    // Disable scroll spy during programmatic scroll
                                    isScrollingRef.current = true;

                                    // If category was active and is being deactivated, scroll to top
                                    if (wasActive) {
                                      setTimeout(() => {
                                        window.scrollTo({
                                          top: 0,
                                          behavior: 'smooth',
                                        });
                                        // Re-enable scroll spy after scroll completes
                                        setTimeout(() => {
                                          isScrollingRef.current = false;
                                        }, 800);
                                      }, 100);
                                      return;
                                    }

                                    // Otherwise, scroll to the respective section
                                    const sectionId =
                                      categoryGroup.category === 'Evaluate side effects'
                                        ? 'evaluate-side-effects'
                                        : `category-${groupIndex}`;

                                    setTimeout(() => {
                                      const element = document.getElementById(sectionId);
                                      if (element) {
                                        element.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        });
                                        // Re-enable scroll spy after scroll completes
                                        setTimeout(() => {
                                          isScrollingRef.current = false;
                                        }, 800);
                                      }
                                    }, 100);
                                  }}
                                >
                                  {isCategoryActive && (
                                    <div className='tw-w-2 tw-h-2 tw-bg-[#3060FE] tw-rounded-full tw-mr-2 tw-flex-shrink-0 tw-animate-pulse'></div>
                                  )}
                                  <span
                                    className={`tw-text-xs ${
                                      isCategoryActive ? 'tw-text-xs tw-font-normal' : 'tw-text-gray-500 tw-font-normal'
                                    }`}
                                  >
                                    {displayName}
                                  </span>
                                </li>
                              );
                            });
                        }
                      })()}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allPharmacies.length === 0 && !error && <p className='tw-text-gray-500 tw-text-sm'>No pharmacies found</p>}
      </aside>
    </>
  );
}
