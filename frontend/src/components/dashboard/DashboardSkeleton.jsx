export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-2.5 w-20 rounded" />
          <div className="skeleton h-8 w-56 rounded-lg" />
          <div className="skeleton h-3 w-72 rounded" />
        </div>
        <div className="skeleton h-9 w-36 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="skeleton h-2.5 w-24 rounded" />
              <div className="skeleton w-8 h-8 rounded-lg" />
            </div>
            <div className="skeleton h-7 w-28 rounded" />
            <div className="skeleton h-2.5 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
        <div className="card p-6">
          <div className="skeleton h-5 w-32 mb-5 rounded" />
          <div className="skeleton h-52 rounded-full w-52 mx-auto" />
          <div className="mt-5 space-y-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-6">
        <div className="skeleton h-5 w-44 mb-5 rounded" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`card p-5 ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
          >
            <div className="skeleton h-5 w-32 mb-4 rounded" />
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="skeleton h-10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
