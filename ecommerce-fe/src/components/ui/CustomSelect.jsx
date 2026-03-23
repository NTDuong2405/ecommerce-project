import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder = "Select option", icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
  const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : (selectedOption || placeholder);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium transition-all hover:bg-slate-50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 group ${isOpen ? 'ring-2 ring-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/5' : 'shadow-sm'}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {Icon && <Icon className={`text-slate-400 group-hover:text-primary-500 transition-colors ${isOpen ? 'text-primary-500' : ''}`} size={16} />}
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>{displayLabel}</span>
        </div>
        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} size={16} />
      </button>

      {/* Options List */}
      <div className={`absolute z-[100] mt-2 w-full bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl transition-all duration-300 origin-top overflow-hidden p-1.5 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="max-h-60 overflow-y-auto no-scrollbar py-0.5">
          {options.map((opt) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const isSelected = optValue === value;

            return (
              <button
                key={optValue}
                type="button"
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 last:mb-0 ${isSelected ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 group'}`}
              >
                <span>{optLabel}</span>
                {isSelected && <Check size={14} className="animate-in zoom-in duration-300" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;
