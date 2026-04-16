export default function Input({ id, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {placeholder}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-600 bg-red-50"
            : "border-gray-300 focus:border-indigo-500 bg-white"
        }`}
      />
      {error && <p className="text-red-600 text-sm font-medium mt-1">{error}</p>}
    </div>
  );
}