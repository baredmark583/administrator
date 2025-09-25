import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SalesChartDataPoint } from '../services/adminApiService';

interface SalesChartProps {
    data: SalesChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-300 p-3 rounded-lg border border-base-100 shadow-xl">
        <p className="label text-sm text-base-content/80">{`${label}`}</p>
        <p className="intro text-primary font-bold">{`Продажи: ${payload[0].value.toLocaleString()} USDT`}</p>
      </div>
    );
  }
  return null;
};


const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4cc9a3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4cc9a3" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#4cc9a3" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default SalesChart;