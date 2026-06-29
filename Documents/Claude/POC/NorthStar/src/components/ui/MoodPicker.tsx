interface MoodPickerProps {
  value?: number
  onChange: (mood: 1 | 2 | 3 | 4 | 5) => void
}

const MOODS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😞', label: 'Hard' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">Select your mood</legend>
      <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3" aria-hidden="true">
        How did today feel?
      </p>
      <div className="flex justify-between gap-2">
        {MOODS.map((mood) => {
          const selected = value === mood.value
          return (
            <button
              key={mood.value}
              type="button"
              aria-label={mood.label}
              aria-pressed={selected}
              onClick={() => onChange(mood.value)}
              className="flex flex-col items-center gap-1 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a] rounded-lg"
            >
              <div
                className={`w-12 h-12 rounded-full border-2 text-xl flex items-center justify-center cursor-pointer transition-all ${
                  selected
                    ? 'border-[#c9a96e] scale-110'
                    : 'border-[#2a2a3e] hover:border-[#4a4a5e]'
                }`}
              >
                {mood.emoji}
              </div>
              <span
                className={`text-xs ${
                  selected ? 'text-[#c9a96e]' : 'text-[#6b6880]'
                }`}
              >
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
