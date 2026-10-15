// Skeleton de carga para tarjetas de noticias
export default function NoticiaCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100 animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-5">
        <div className="flex gap-2 mb-3">
          <div className="h-4 w-20 bg-gray-200 rounded-full" />
          <div className="h-4 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-full bg-gray-200 rounded mb-1" />
        <div className="h-3 w-5/6 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-4/6 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
