interface GroupGridProps {
  children: React.ReactNode;
  title: string;
}

function GroupGrid({ children, title }: GroupGridProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
        {children}
      </div>
    </div>
  );
}

export default GroupGrid;
