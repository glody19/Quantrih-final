const fs = require('fs');

let content = fs.readFileSync('src/components/profile/InvestorProfileForm.tsx', 'utf8');

// Insert CustomSelect component after imports
const customSelectCode = `
const CustomSelect = ({ value, onChange, children, className }: any) => {
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

  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child) && child.type === 'option'
  );

  const selectedOption = options.find((opt) => opt.props.value === value);
  const displayLabel = selectedOption ? selectedOption.props.children : "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={\`\${className} flex items-center justify-between text-left relative z-10\`}
      >
        <span className="truncate pr-4">{displayLabel}</span>
        <ChevronDown className={\`w-4 h-4 shrink-0 transition-transform duration-300 \${isOpen ? 'rotate-180 text-blue-400' : 'text-zinc-400'}\`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden p-1.5 min-w-full"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
              {options.map((opt) => (
                <button
                  key={opt.props.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: opt.props.value } });
                    setIsOpen(false);
                  }}
                  className={\`w-full text-left px-4 py-3 rounded-2xl cursor-pointer hover:scale-[1.03] transition-all duration-300 ease-out flex items-center justify-between group \${
                    opt.props.value === value
                      ? 'bg-blue-600/20 text-blue-400 font-bold shadow-sm'
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white hover:shadow-md'
                  }\`}
                >
                  <span className="truncate">{opt.props.children}</span>
                  {opt.props.value === value && <Check className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

if (!content.includes('const CustomSelect')) {
  content = content.replace(/(const STEPS =)/, customSelectCode + '\n$1');
}

// Replace <select ...> with <CustomSelect ...>
content = content.replace(/<select\b([^>]*)>/g, '<CustomSelect$1>');
// Replace </select> with </CustomSelect>
content = content.replace(/<\/select>/g, '</CustomSelect>');

fs.writeFileSync('src/components/profile/InvestorProfileForm.tsx', content, 'utf8');
console.log("Successfully replaced select with CustomSelect");
