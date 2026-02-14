import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout';
import { Card, CardContent, Skeleton } from '../components/ui';
import { useResourceCategories } from '../hooks';
import { getResourceById } from '../lib/firestore';
import { type Resource, type ResourceContentBlock } from '../types';

function formatDate(timestamp: { toDate?: () => Date } | undefined): string {
  if (!timestamp) return 'N/A';
  try {
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

function ResourceDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40" />
      <Card className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <CardContent>
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}

function NotFoundState() {
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
          <p className="text-gray-600 font-medium">Resource not found</p>
          <p className="text-sm text-gray-400 mt-1">
            It may have been removed or is no longer available.
          </p>
        </div>
        <Link
          to="/resources"
          className="text-sm font-medium text-forest-600 hover:text-forest-700"
        >
          Back to Resources
        </Link>
      </div>
    </Card>
  );
}

export function ResourceDetail() {
  const { resourceId } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categories } = useResourceCategories();
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.name, cat.label));
    return map;
  }, [categories]);

  useEffect(() => {
    let isMounted = true;

    const fetchResource = async () => {
      if (!resourceId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getResourceById(resourceId);
        if (!isMounted) return;
        if (!data || !data.isVisible) {
          setResource(null);
        } else {
          setResource(data as Resource);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error loading resource:', err);
        setError('Failed to load resource');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResource();

    return () => {
      isMounted = false;
    };
  }, [resourceId]);

  const renderBlock = (block: ResourceContentBlock, index: number) => {
    if (block.type === 'heading') {
      return (
        <h2 key={`heading-${index}`} className="text-2xl font-semibold text-gray-900">
          {typeof block.text === 'string' ? block.text : ''}
        </h2>
      );
    }

    if (block.type === 'paragraph') {
      return (
        <p key={`paragraph-${index}`} className="text-gray-700 leading-relaxed whitespace-pre-line">
          {typeof block.text === 'string' ? block.text : ''}
        </p>
      );
    }

    if (block.type === 'list') {
      const items = Array.isArray(block.items) ? block.items : [];
      if (items.length === 0) {
        return null;
      }
      return (
        <ul key={`list-${index}`} className="list-disc list-inside text-gray-700 space-y-1">
          {items.map((item, itemIndex) => (
            <li key={`list-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <div key={`image-${index}`} className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {block.imageUrl && (
          <img
            src={block.imageUrl}
            alt={block.alt || resource?.title || 'Resource image'}
            className="w-full h-auto"
          />
        )}
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
        <Link
          to="/resources"
          className="inline-flex items-center text-sm font-medium text-forest-600 hover:text-forest-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Resources
        </Link>
        </div>

        {loading ? (
          <ResourceDetailLoading />
        ) : error ? (
          <Card className="text-center py-12 text-sm text-red-600">
            {error}
          </Card>
        ) : !resource ? (
          <NotFoundState />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-forest-50 text-forest-700">
                {categoryMap.get(resource.category) || resource.category}
              </span>
              <span className="text-xs text-gray-500">Published {formatDate(resource.createdAt)}</span>
              {resource.updatedAt && (
                <span className="text-xs text-gray-400">Updated {formatDate(resource.updatedAt)}</span>
              )}
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">{resource.title}</h1>
            <Card className="overflow-hidden">
              {resource.imageUrl && (
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={resource.imageUrl}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent>
                {resource.contentBlocks && resource.contentBlocks.length > 0 ? (
                  <div className="space-y-5">
                    {resource.contentBlocks.map((block, index) => renderBlock(block, index))}
                  </div>
                ) : (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {resource.text}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
