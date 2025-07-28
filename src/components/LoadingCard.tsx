import React from 'react';

const LoadingCard: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="loading loading-spinner loading-lg text-primary"></div>
    </div>
  );
};

export default LoadingCard;