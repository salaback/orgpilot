import React from 'react';

interface AppLogoIconProps {
  className?: string;
  size?: number;
}

const AppLogoIcon: React.FC<AppLogoIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
};

export default AppLogoIcon;
