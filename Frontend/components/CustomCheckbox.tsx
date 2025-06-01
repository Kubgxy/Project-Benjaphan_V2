"use client";

import React from "react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-center cursor-pointer select-none ${className}`}
    >
      <input
        type="checkbox"
        className="peer hidden"
        checked={checked}
        onChange={onChange}
      />
      <div
        className="w-5 h-5 rounded border-2 border-yellow-500 flex items-center justify-center
                   peer-checked:bg-yellow-500 peer-checked:border-yellow-500
                   transition duration-150 ease-in-out
                   hover:ring-2 hover:ring-yellow-300
                   mr-2"
      >
        <svg
          className="w-4 h-4 text-white peer-checked:opacity-100 transition drop-shadow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      {label && <span className="text-sm text-brown-800">{label}</span>}
    </label>
  );
};

export default CustomCheckbox;
