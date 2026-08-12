type Props = {
  sizes: string[];
  selectedSize: string;
  onChange: (size: string) => void;
};

export function SizeSelector({ sizes, selectedSize, onChange }: Props) {
  return (
    <div className="space-y-3 pb-6 border-b border-gray-100 mb-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[15px] font-bold text-gray-900">EUR Size</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const isSelected = selectedSize === s;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`flex h-9 min-w-[42px] px-2 items-center justify-center rounded-md border text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "border-gray-900 bg-white text-gray-900"
                  : "border-transparent bg-[#F5F5F5] text-gray-700 hover:border-gray-300"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
