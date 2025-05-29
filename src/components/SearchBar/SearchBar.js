// components/SearchBar/SearchBar.js
import React, { useState } from 'react';
import { Search } from 'react-feather';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleSearchClick = () => {
    setShowInput(!showInput);
    if (!showInput) {
      setSearchQuery('');
      
    }
  };

  return (
    <div className="search-bar">
      {showInput && (
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          className="search-input"
        />
      )}
      <Search onClick={handleSearchClick} className="search-icon" />
    </div>
  );
};

export default SearchBar;
