"use client";
import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: ReactNode;
}

export const Tooltip = ({ children, text }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-700 rounded-md shadow-lg -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full whitespace-nowrap" style={{ minWidth: 'max-content' }}>
          {text}
          <svg className="absolute text-gray-700 h-2 w-full left-0 bottom-[-8px] translate-y-full" x="0px" y="0px" viewBox="0 0 255 255">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
          </svg>
        </div>
      )}
    </div>
  );
};