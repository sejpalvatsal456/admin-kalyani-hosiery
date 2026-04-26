import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function StatsCard({
  label,
  value,
  themeColor
}: {
  label: string;
  value: number | string;
  themeColor: string;
}) {
  return (
    <div style={{ borderColor: themeColor }} className="bg-white shadow rounded-lg flex flex-row border-l-4">
      <div className="w-[90%] flex flex-col justify-between m-6 mr-0">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
      </div>
      <div className="w-[30%] h-[100%] self-center flex items-center justify-center cursor-pointer hover:bg-gray-100">
        <MdKeyboardArrowRight size={30} />
      </div>
    </div>
  );
}
