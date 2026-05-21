function ColorPicker({ value, onChange }) {
    const presetColors = [
        "#ef4444", "#f97316", "#f59e0b", "#eab308",
        "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
        "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
        "#d946ef", "#ec4899", "#64748b", "#78716c",
    ];

    return (
        <div className="flex flex-col gap-3">
            {/* Color preview + hex input + native picker */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Native color picker hidden behind the preview */}
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                        style={{ backgroundColor: value }}
                    />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                {/* Hex input */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#3b82f6"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-28"
                />

                <span className="text-xs text-gray-400 hidden sm:inline">
                    Click the square to pick any color
                </span>
            </div>

            {/* Preset quick-pick colors */}
            <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={`w-7 h-7 rounded-md border-2 cursor-pointer transition-transform hover:scale-110 ${
                            value === color
                                ? "border-gray-800 scale-110"
                                : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        </div>
    );
}

export default ColorPicker;