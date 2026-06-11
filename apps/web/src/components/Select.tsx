'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
}

export function Select({
  options,
  value,
  onChange,
  className = '',
  ariaLabel,
  placeholder = '',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} className={`custom-select${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="custom-select__trigger"
        onClick={() => setOpen(!open)}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <span className="custom-select__value">
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`custom-select__arrow${open ? ' custom-select__arrow--open' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="custom-select__menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-select__option${opt.value === value ? ' custom-select__option--selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .custom-select {
          position: relative;
          width: 100%;
        }

        .custom-select__trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          font-family: inherit;
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .custom-select__trigger:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .custom-select__trigger:focus-visible {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
          outline: none;
        }

        .custom-select__value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .custom-select__arrow {
          flex-shrink: 0;
          color: #6B6B80;
          transition: transform 150ms ease;
        }

        .custom-select__arrow--open {
          transform: rotate(180deg);
        }

        .custom-select__menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 100;
          background: #1A1A2E;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.375rem;
          list-style: none;
          margin: 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          max-height: 240px;
          overflow-y: auto;
        }

        .custom-select__option {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-family: inherit;
          color: #C0C0D0;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background 100ms ease, color 100ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .custom-select__option:hover {
          background: rgba(124, 58, 237, 0.12);
          color: #FFFFFF;
        }

        .custom-select__option--selected {
          color: #A78BFA;
          font-weight: 600;
        }

        .custom-select__option--selected::before {
          content: '✓ ';
          color: #A78BFA;
        }
      `}</style>
    </div>
  );
}