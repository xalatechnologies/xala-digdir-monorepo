/**
 * DocsRightTOC Component
 *
 * Right sidebar Table of Contents with:
 * - Auto-generated from H2/H3 headings
 * - Active section highlighting on scroll (IntersectionObserver)
 * - Smooth scroll on click
 *
 * Similar to TailwindCSS docs right TOC.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { TocItem } from '../../types';
import styles from './DocsRightTOC.module.css';

interface DocsRightTOCProps {
  items: TocItem[];
  /** Optional callback when TOC item is clicked */
  onItemClick?: (id: string) => void;
}

export function DocsRightTOC({ items, onItemClick }: DocsRightTOCProps) {
  const t = useT();
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up IntersectionObserver to track which heading is in view
  useEffect(() => {
    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            // Sort by vertical position
            const rectA = a.target.getBoundingClientRect();
            const rectB = b.target.getBoundingClientRect();
            return rectA.top - rectB.top;
          });

        if (intersecting.length > 0 && intersecting[0]?.target) {
          setActiveId(intersecting[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-80px 0px -70% 0px', // Top offset for header, bottom threshold
        threshold: 0,
      }
    );

    headingElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      
      const element = document.getElementById(id);
      if (element) {
        // Smooth scroll to element with offset for header
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Update URL hash without jumping
        window.history.pushState(null, '', `#${id}`);
        
        // Update active state immediately
        setActiveId(id);
        
        // Callback if provided
        onItemClick?.(id);
      }
    },
    [onItemClick]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={styles.tocContainer} aria-label={t('docs.toc.label') || 'Innholdsfortegnelse'}>
      <Paragraph data-size="sm" className={styles.tocTitle}>
        {t('docs.toc.title') || 'På denne siden'}
      </Paragraph>
      
      <ul className={styles.tocList}>
        {items.map((item) => (
          <li key={item.id} className={styles.tocItem}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`${styles.tocLink} ${
                item.level === 3 ? styles.level3 : ''
              } ${activeId === item.id ? styles.active : ''}`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default DocsRightTOC;
