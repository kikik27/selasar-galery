import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

export const ArtworkCardSkeleton = () => (
  <div className="rounded-card overflow-hidden bg-white/5 border border-white/10 flex flex-col h-full">
    <Skeleton className="aspect-[4/5] rounded-none" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="pt-4 space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row items-center gap-8 mb-20 bg-white/[0.02] border border-white/5 p-12 rounded-card backdrop-blur-xl">
    <Skeleton className="w-32 h-32 rounded-full" />
    <div className="flex-1 space-y-4">
      <Skeleton className="h-12 w-64 mx-auto md:mx-0" />
      <Skeleton className="h-20 w-full max-w-2xl" />
      <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-8">
        <div className="space-y-2">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  </div>
);

export const ArtworkDetailSkeleton = () => (
  <div className="pt-32 px-6 max-w-7xl mx-auto pb-40">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <Skeleton className="aspect-square w-full rounded-card" />
      <div className="space-y-12">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

