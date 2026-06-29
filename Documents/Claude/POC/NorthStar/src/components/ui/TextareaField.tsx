interface TextareaFieldProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  rows?: number
}

export default function TextareaField({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-2">{label}</p>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors resize-none"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
