import { type Resource, type ResourceCategory } from '../../types';
import { Button, Card } from '../ui';

interface ResourcesListProps {
  resources: Resource[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onAdd: () => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onToggleVisibility: (resource: Resource) => void;
  onPageChange: (page: number) => void;
}

/** Format a Firestore Timestamp or fallback for display. */
function formatDate(timestamp: { toDate?: () => Date } | undefined): string {
  if (!timestamp) return 'N/A';
  try {
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/** Truncate text to a given character limit with ellipsis. */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/** Get category label from value */
function getCategoryLabel(category: ResourceCategory): string {
  const labels: Record<ResourceCategory, string> = {
    'gear': 'Ideal Gear',
    'hatch-charts': 'Hatch Charts',
    'techniques': 'Techniques',
    'locations': 'Locations',
    'other': 'Other',
  };
  return labels[category] || category;
}

export function ResourcesList({
  resources,
  loading,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisibility,
  onPageChange,
}: ResourcesListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-forest-700">Manage Resources</h2>
          <Button variant="primary" disabled>Add Resource</Button>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-32" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-forest-700">
          Manage Resources
          {resources.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({resources.length} total)
            </span>
          )}
        </h2>
        <Button variant="primary" onClick={onAdd} aria-label="Add new resource">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Resource
          </span>
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 font-medium">No resources yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first resource to get started.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onAdd}>
              Add First Resource
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-forest-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-forest-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={resource.imageUrl}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900">{truncateText(resource.title, 50)}</div>
                        <div className="text-sm text-gray-500 mt-1">{truncateText(resource.text, 80)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest-100 text-forest-800">
                        {getCategoryLabel(resource.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          resource.isVisible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {resource.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(resource.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => onToggleVisibility(resource)}
                        className="text-trout-gold hover:text-trout-gold/80 transition-colors"
                        title={resource.isVisible ? 'Hide resource' : 'Show resource'}
                      >
                        {resource.isVisible ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(resource)}
                        className="text-forest-600 hover:text-forest-800 transition-colors"
                        title="Edit resource"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(resource)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete resource"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={resource.imageUrl}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {truncateText(resource.title, 50)}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {truncateText(resource.text, 60)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-forest-100 text-forest-800">
                        {getCategoryLabel(resource.category)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          resource.isVisible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {resource.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">{formatDate(resource.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onToggleVisibility(resource)}>
                      {resource.isVisible ? 'Hide' : 'Show'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onEdit(resource)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onDelete(resource)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> resources
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === currentPage;
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
