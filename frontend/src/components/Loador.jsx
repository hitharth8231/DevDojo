export default function Loader({ size = "md", fullScreen = false }) {
  const sizeClasses = {
    sm: "h-8 w-8 border-b-2",
    md: "h-12 w-12 border-b-2",
    lg: "h-16 w-16 border-b-4"
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`inline-block animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} border-indigo-600`}></div>
      <p className="text-gray-600 text-sm">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      {loaderContent}
    </div>
  );
}