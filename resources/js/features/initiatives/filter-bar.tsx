import React from 'react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ search, onSearchChange }) => {
  return (
    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        position: 'relative',
        display: 'inline-block',
        width: 280,
      }}>
        <input
          type="text"
          placeholder="Search initiatives..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          style={{
            padding: '10px 40px 10px 16px',
            width: '100%',
            borderRadius: 24,
            border: '2px solid #000',
            outline: 'none',
            fontSize: 16,
            boxSizing: 'border-box',
            background: '#fff',
            color: '#222',
            transition: 'border-color 0.2s',
          }}
        />
        <span style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* SVG search icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7" stroke="#000" strokeWidth="2" />
            <line x1="14.4142" y1="14" x2="18" y2="17.5858" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default FilterBar;
