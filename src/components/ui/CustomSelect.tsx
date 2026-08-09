import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({ value, onChange, children, className, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const childrenArray = React.Children.toArray(children);
  
  let allOptions: { value: any; label: React.ReactNode; disabled?: boolean; groupLabel?: string }[] = [];
  let groupedOptions: { groupLabel: string; options: { value: any; label: React.ReactNode; disabled?: boolean }[] }[] = [];

  childrenArray.forEach((child) => {
    if (React.isValidElement(child)) {
      const props = child.props as any;
      if (child.type === 'option') {
        const opt = {
          value: props.value,
          label: props.children,
          disabled: props.disabled,
        };
        allOptions.push(opt);
      } else if (child.type === 'optgroup' || (props && props.label && props.children)) {
        const groupLabel = props.label;
        const groupOpts: { value: any; label: React.ReactNode; disabled?: boolean }[] = [];
        const groupChildren = React.Children.toArray(props.children);
        groupChildren.forEach((gChild) => {
          if (React.isValidElement(gChild) && gChild.type === 'option') {
            const gProps = gChild.props as any;
            const opt = {
              value: gProps.value,
              label: gProps.children,
              disabled: gProps.disabled,
            };
            groupOpts.push(opt);
            allOptions.push({ ...opt, groupLabel });
          }
        });
        if (groupOpts.length > 0) {
          groupedOptions.push({ groupLabel, options: groupOpts });
        }
      }
    }
  });

  const selectedOption = allOptions.find((opt) => String(opt.value) === String(value)) || allOptions[0];
  const displayLabel = selectedOption ? selectedOption.label : "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between text-left relative z-10 transition-all duration-300 transform hover:scale-[1.01] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate pr-3 font-medium">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pv-blue' : 'text-text-3'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[300] left-0 right-0 mt-2 bg-surface-2/95 backdrop-blur-2xl border border-border rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-1.5 min-w-[160px]"
          >
            <div className="max-h-60 sm:max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-pv-blue/50 flex flex-col gap-1 pr-1">
              {groupedOptions.length > 0 ? (
                groupedOptions.map((group, gIdx) => (
                  <div key={gIdx} className="flex flex-col gap-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-3/70 bg-surface-3/50 rounded-lg mt-1">
                      {group.groupLabel}
                    </div>
                    {group.options.map((opt) => {
                      const isSelected = String(opt.value) === String(value);
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          disabled={opt.disabled}
                          onClick={() => {
                            if (!opt.disabled) {
                              onChange({ target: { value: opt.value } });
                              setIsOpen(false);
                            }
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl cursor-pointer hover:scale-[1.03] transition-all duration-200 ease-out flex items-center justify-between group ${
                            opt.disabled ? 'opacity-40 cursor-not-allowed' :
                            isSelected
                              ? 'bg-pv-blue/20 text-pv-blue font-bold shadow-sm border border-pv-blue/30'
                              : 'text-text hover:bg-surface-3 hover:text-pv-blue'
                          }`}
                        >
                          <span className="truncate text-xs sm:text-sm font-semibold">{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-pv-blue shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                allOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        if (!opt.disabled) {
                          onChange({ target: { value: opt.value } });
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl cursor-pointer hover:scale-[1.03] transition-all duration-200 ease-out flex items-center justify-between group ${
                        opt.disabled ? 'opacity-40 cursor-not-allowed' :
                        isSelected
                          ? 'bg-pv-blue/20 text-pv-blue font-bold shadow-sm border border-pv-blue/30'
                          : 'text-text hover:bg-surface-3 hover:text-pv-blue'
                      }`}
                    >
                      <span className="truncate text-xs sm:text-sm font-semibold">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-pv-blue shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

