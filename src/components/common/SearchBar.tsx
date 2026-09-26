import React from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search...', className }) => (
  <div className={`relative ${className ?? ''}`}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
    <input
      className="input pl-9"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  </div>
)

export default SearchBar
