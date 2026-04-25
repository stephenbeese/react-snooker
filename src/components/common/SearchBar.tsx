/**
 * SearchBar component - Debounced search input
 */

import { useState, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = 'Search...' }: SearchBarProps) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setValue(term);
    onSearch(term);
  }, [onSearch]);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="search-bar"
    />
  );
};
