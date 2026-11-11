import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export default function SearchableSelect({
  options = [], // [{ value, label, group? }]
  value = '',
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type to search...',
  required = false,
  groupBy = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.group && opt.group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.value === value);

  // Grouping logic if requested
  const groups = groupBy
    ? filteredOptions.reduce((acc, opt) => {
        const g = opt.group || 'Other';
        if (!acc[g]) acc[g] = [];
        acc[g].push(opt);
        return acc;
      }, {})
    : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selected trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between text-sm transition-all bg-white ${
          isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-500/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className={selectedOption ? 'text-slate-800 font-medium truncate' : 'text-slate-400 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {selectedOption && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn max-h-72 flex flex-col">
          {/* Search header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matches found
              </div>
            ) : groups ? (
              Object.entries(groups).map(([groupName, groupOpts]) => (
                <div key={groupName} className="py-1">
                  <div className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50/50 rounded-md">
                    {groupName}
                  </div>
                  {groupOpts.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors ${
                        opt.value === value
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {opt.value === value && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors ${
                    opt.value === value
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
