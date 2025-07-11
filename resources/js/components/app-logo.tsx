import React from 'react';

const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <img src="/logo.svg" alt="App Logo" className="h-8 w-auto" />
      <span className="text-xl font-semibold">OrgPilot</span>
    </div>
  );
};

export default AppLogo;
