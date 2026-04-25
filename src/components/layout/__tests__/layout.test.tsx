/**
 * Layout components tests
 */

import { describe, it, expect } from 'vitest';
import { Header, Navigation, Sidebar, Footer, Layout } from '../index';

describe('Layout Components', () => {
  describe('Component Exports', () => {
    it('exports Header component', () => {
      expect(Header).toBeDefined();
      expect(typeof Header).toBe('function');
    });

    it('exports Navigation component', () => {
      expect(Navigation).toBeDefined();
      expect(typeof Navigation).toBe('function');
    });

    it('exports Sidebar component', () => {
      expect(Sidebar).toBeDefined();
      expect(typeof Sidebar).toBe('function');
    });

    it('exports Footer component', () => {
      expect(Footer).toBeDefined();
      expect(typeof Footer).toBe('function');
    });

    it('exports Layout component', () => {
      expect(Layout).toBeDefined();
      expect(typeof Layout).toBe('function');
    });
  });

  describe('Component Structure', () => {
    it('Header component has correct name', () => {
      expect(Header.name).toBe('Header');
    });

    it('Navigation component has correct name', () => {
      expect(Navigation.name).toBe('Navigation');
    });

    it('Sidebar component has correct name', () => {
      expect(Sidebar.name).toBe('Sidebar');
    });

    it('Footer component has correct name', () => {
      expect(Footer.name).toBe('Footer');
    });

    it('Layout component has correct name', () => {
      expect(Layout.name).toBe('Layout');
    });
  });
});