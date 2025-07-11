import React from 'react';

interface FilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ search, onSearchChange }) => {
    const handleClear = () => {
        onSearchChange('');
    };

    return (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: 280,
                }}
            >
                <input
                    type="text"
                    placeholder="Search initiatives..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        padding: search ? '10px 40px 10px 16px' : '10px 16px',
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
                {search && (
                    <button
                        onClick={handleClear}
                        style={{
                            position: 'absolute',
                            right: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 4,
                            borderRadius: '50%',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Clear search"
                    >
                        {/* X (close) icon */}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
