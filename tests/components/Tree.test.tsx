// @vitest-environment jsdom
import { vi } from 'vitest';

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
});

/**
 * tests/components/Tree.test.tsx
 *
 * Unit tests for AnimatedTreeSVG component.
 * Verifies accessible roles and dynamic title/desc rendering based on tree growth progress.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnimatedTreeSVG from '../../components/tree/AnimatedTreeSVG';

describe('AnimatedTreeSVG component', () => {
  it('renders SVG with role="img"', () => {
    render(<AnimatedTreeSVG growthProgress={15} />);
    const svgElement = screen.getByRole('img');
    expect(svgElement).toBeDefined();
    expect(svgElement.getAttribute('aria-labelledby')).toContain('tree-title-1');
  });

  it('renders Sapling title and description at 10% progress', () => {
    render(<AnimatedTreeSVG growthProgress={10} />);
    
    // Check that title has the correct text content
    const titleEl = document.querySelector('title');
    expect(titleEl).not.toBeNull();
    expect(titleEl?.textContent?.trim()).toContain('Sapling');
    expect(titleEl?.textContent?.trim()).toContain('10% growth');

    const descEl = document.querySelector('desc');
    expect(descEl).not.toBeNull();
    expect(descEl?.textContent?.trim()).toContain('Just sprouted from the soil');
  });

  it('renders Young Tree title and description at 30% progress', () => {
    render(<AnimatedTreeSVG growthProgress={30} />);
    
    const titleEl = document.querySelector('title');
    expect(titleEl?.textContent?.trim()).toContain('Young Tree');
    expect(titleEl?.textContent?.trim()).toContain('30% growth');

    const descEl = document.querySelector('desc');
    expect(descEl?.textContent?.trim()).toContain('Developing first leaves');
  });

  it('renders Growing Tree title and description at 55% progress', () => {
    render(<AnimatedTreeSVG growthProgress={55} />);
    
    const titleEl = document.querySelector('title');
    expect(titleEl?.textContent?.trim()).toContain('Growing Tree');

    const descEl = document.querySelector('desc');
    expect(descEl?.textContent?.trim()).toContain('Growing strong branches');
  });

  it('renders Mature Tree title and description at 80% progress', () => {
    render(<AnimatedTreeSVG growthProgress={80} />);
    
    const titleEl = document.querySelector('title');
    expect(titleEl?.textContent?.trim()).toContain('Mature Tree');

    const descEl = document.querySelector('desc');
    expect(descEl?.textContent?.trim()).toContain('Blossoming and stable');
  });

  it('renders Ancient Tree title and description at 95% progress', () => {
    render(<AnimatedTreeSVG growthProgress={95} />);
    
    const titleEl = document.querySelector('title');
    expect(titleEl?.textContent?.trim()).toContain('Ancient Tree');

    const descEl = document.querySelector('desc');
    expect(descEl?.textContent?.trim()).toContain('A pillar of the community grove');
    expect(descEl?.textContent?.trim()).toContain('Your tree has reached full Ancient Tree status.');
  });
});
