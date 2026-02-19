"use client";

import React from "react";

export interface CustomSelectProps {
  placeholder: string;
  options: string[];
  onChange?: (value: string) => void; // ✅ ADD THIS
}

const CustomSelect = ({ placeholder, options, onChange }: CustomSelectProps) => {
  return (
    <select
      className="border px-3 py-2 rounded-md bg-white dark:bg-neutral-800"
      value={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)} // ✅ TRIGGER onChange
    >
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

export default CustomSelect;
