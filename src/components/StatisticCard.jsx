import React from "react";

function StatisticCard({ title, statistic, color }) {
  return (
    <div className="relative transition hover:scale-105 bg-white p-4 sm:p-6 shadow-md inner-border-2 inner-border-black inner-border-solid">
      <div className="absolute h-8 w-8 bg-white top-0 left-0 border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
        <div className="absolute inset-0 bg-transparent">
          <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
      <h3 className="text-lg font-semibold pl-3 sm:text-xl mb-2 sm:mb-4">{title}</h3>
      <p className={`text-3xl sm:text-4xl font-bold text-${color}-600`}>
        {statistic}
      </p>
    </div>
  );
}

export default StatisticCard;
