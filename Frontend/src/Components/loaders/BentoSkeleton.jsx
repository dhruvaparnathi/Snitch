import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-white border-2 border-black rounded-[28px] p-5 shadow-[3px_3px_0px_#000000] flex flex-col justify-between animate-pulse">
      <div>
        <div className="h-56 rounded-[20px] bg-[#EFE4DE] border-2 border-black mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
        <div className="w-20 h-3 bg-[#EFE4DE] rounded-full mb-2" />
        <div className="w-3/4 h-6 bg-[#EFE4DE] rounded-xl mb-3" />
        <div className="w-full h-4 bg-[#EFE4DE] rounded-lg mb-2" />
        <div className="w-2/3 h-4 bg-[#EFE4DE] rounded-lg mb-4" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t-2 border-black/10">
        <div className="w-24 h-6 bg-[#EFE4DE] rounded-lg" />
        <div className="w-16 h-8 bg-[#EFE4DE] rounded-xl border border-black" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 pl-2 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#EFE4DE] border-2 border-black" />
        <div className="space-y-1.5 flex-1">
          <div className="w-28 h-4 bg-[#EFE4DE] rounded" />
          <div className="w-40 h-3 bg-[#EFE4DE] rounded" />
        </div>
      </td>
      <td className="py-4">
        <div className="w-20 h-4 bg-[#EFE4DE] rounded" />
      </td>
      <td className="py-4">
        <div className="w-16 h-5 bg-[#EFE4DE] rounded" />
      </td>
      <td className="py-4">
        <div className="w-20 h-6 bg-[#EFE4DE] rounded-full border border-black" />
      </td>
      <td className="py-4 pr-2 text-right">
        <div className="w-8 h-8 bg-[#EFE4DE] rounded-xl inline-block border border-black" />
      </td>
    </tr>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="h-[380px] sm:h-[480px] rounded-[32px] bg-white border-2 border-black shadow-[4px_4px_0px_#000000]" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-[#1677FF]/40 rounded-2xl border-2 border-black" />
          <div className="h-20 bg-[#FFB800]/40 rounded-2xl border-2 border-black" />
          <div className="h-20 bg-[#C4A1FF]/40 rounded-2xl border-2 border-black" />
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white border-2 border-black rounded-[32px] p-8 shadow-[4px_4px_0px_#000000] space-y-4">
          <div className="w-24 h-4 bg-[#EFE4DE] rounded" />
          <div className="w-3/4 h-8 bg-[#EFE4DE] rounded-xl" />
          <div className="h-16 bg-[#F5EBE6] rounded-2xl border-2 border-black" />
          <div className="w-full h-16 bg-[#EFE4DE] rounded-xl" />
          <div className="w-full h-14 bg-[#00E676]/40 rounded-full border-2 border-black" />
        </div>
        <div className="h-44 bg-[#FF5500]/40 rounded-[28px] border-2 border-black" />
      </div>
    </div>
  );
}
