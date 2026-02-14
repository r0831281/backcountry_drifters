import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, PageHeader } from '../components/layout';
import { Button, Card, CardContent, Input, Skeleton } from '../components/ui';
import { useResources, useResourceCategories } from '../hooks';
import { type Resource } from '../types';

/** Get category color - using a hash to generate consistent colors */
function getCategoryColor(category: string): string {
  // Generate a consistent color based on category name hash
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-teal-100 text-teal-800',
    'bg-red-100 text-red-800',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

function ResourceCard({ resource, categoryLabel }: { resource: Resource; categoryLabel: string }) {
  const previewText = getResourcePreviewText(resource);
  return (
    <Link
      to={`/resources/${resource.id}`}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-2 rounded-xl"
      aria-label={`View details for ${resource.title}`}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Image - only show if available */}
        {resource.imageUrl && (
          <div className="aspect-video overflow-hidden bg-gray-100">
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <CardContent className="flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="mb-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {resource.title}
          </h3>

          {/* Text Content */}
          <div className="text-gray-600 leading-relaxed whitespace-pre-line flex-1">
            {previewText}
          </div>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-forest-600">
            Read resource
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function getResourcePreviewText(resource: Resource): string {
  if (resource.contentBlocks && resource.contentBlocks.length > 0) {
    const paragraph = resource.contentBlocks.find((block) => block.type === 'paragraph' && block.text.trim().length > 0);
    if (paragraph && paragraph.type === 'paragraph') {
      return truncateText(paragraph.text, 220);
    }

    const list = resource.contentBlocks.find((block) => block.type === 'list' && block.items.length > 0);
    if (list && list.type === 'list') {
      return truncateText(list.items.join(', '), 220);
    }
  }

  if (resource.text) {
    return truncateText(resource.text, 220);
  }

  return 'No description available.';
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

function getResourceSearchText(resource: Resource): string {
  const blocksText = resource.contentBlocks
    ? resource.contentBlocks
        .map((block) => {
          if (block.type === 'heading' || block.type === 'paragraph') return block.text;
          if (block.type === 'list') return block.items.join(' ');
          return '';
        })
        .join(' ')
    : '';

  return [resource.title, resource.text || '', blocksText]
    .join(' ')
    .toLowerCase();
}
function ResourcesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardContent>
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ isFiltered, onClear }: { isFiltered: boolean; onClear: () => void }) {
  return (
    <Card className="text-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-forest-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <div>
          <p className="text-gray-600 font-medium">
            {isFiltered ? 'No matching resources' : 'No resources available'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {isFiltered
              ? 'Try adjusting your search or category filters.'
              : 'Check back soon for guides, tips, and information.'}
          </p>
        </div>
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
}

export function Resources() {
  const { resources, loading } = useResources({ includeHidden: false, limitCount: 100 });
  const { categories, loading: categoriesLoading } = useResourceCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resourceSearch, setResourceSearch] = useState('');

  // Create category map for labels
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => map.set(cat.name, cat.label));
    return map;
  }, [categories]);

  const filteredResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesSearch = query.length === 0 || getResourceSearchText(resource).includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [resources, selectedCategory, resourceSearch]);

  const hasActiveFilters = selectedCategory !== 'all' || resourceSearch.trim().length > 0;

  const resourcesContent = loading || categoriesLoading
    ? <ResourcesLoading />
    : filteredResources.length === 0
      ? (
        <EmptyState
          isFiltered={hasActiveFilters}
          onClear={() => {
            setResourceSearch('');
            setSelectedCategory('all');
          }}
        />
      )
      : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              categoryLabel={categoryMap.get(resource.category) || resource.category}
            />
          ))}
        </div>
      );

  return (
    <PageContainer>
      <PageHeader
        title="Resources"
        subtitle="Explore our collection of fly fishing guides, gear recommendations, hatch charts, and expert techniques to enhance your Alberta fishing experience"
      />

      {/* Category Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              label="Search"
              value={resourceSearch}
              onChange={(e) => setResourceSearch(e.target.value)}
              placeholder="Search guides, tips, and techniques..."
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setResourceSearch('');
              setSelectedCategory('all');
            }}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-2
              ${selectedCategory === 'all'
                ? 'bg-forest-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            All Resources
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trout-gold focus-visible:ring-offset-2
                ${selectedCategory === category.name
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {!loading && filteredResources.length > 0 && (
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
          {selectedCategory !== 'all' && ` in ${categoryMap.get(selectedCategory) || selectedCategory}`}
          {resourceSearch.trim().length > 0 && ` matching "${resourceSearch.trim()}"`}
        </div>
      )}

      {/* Resources Grid */}
      {resourcesContent}
    </PageContainer>
  );
}
