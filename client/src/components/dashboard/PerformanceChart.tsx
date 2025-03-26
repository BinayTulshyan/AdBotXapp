import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// This is sample data for the chart
// In a real implementation, this would be replaced with actual performance data
const data = [
  { name: 'Day 1', impressions: 2500, clicks: 120, spend: 45 },
  { name: 'Day 2', impressions: 3000, clicks: 148, spend: 51 },
  { name: 'Day 3', impressions: 2800, clicks: 135, spend: 49 },
  { name: 'Day 4', impressions: 3200, clicks: 160, spend: 53 },
  { name: 'Day 5', impressions: 3500, clicks: 175, spend: 56 },
  { name: 'Day 6', impressions: 3700, clicks: 190, spend: 60 },
  { name: 'Day 7', impressions: 4000, clicks: 210, spend: 65 },
];

export default function PerformanceChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
          <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="impressions"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="spend"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
