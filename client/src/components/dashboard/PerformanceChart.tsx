import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PerformanceChartProps {
  data: Record<string, any>[];
  dataKeys: string[];
  xAxisKey: string;
  type?: 'line' | 'area' | 'bar';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

const defaultColors = [
  "#9333EA", // primary - purple
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#8B5CF6", // violet
  "#6366F1", // indigo
];

export function PerformanceChart({
  data,
  dataKeys,
  xAxisKey,
  type = 'line',
  colors = defaultColors,
  showLegend = true,
  showGrid = true,
}: PerformanceChartProps) {
  const getStroke = (index: number) => {
    return colors[index % colors.length];
  };

  const getFill = (index: number) => {
    return colors[index % colors.length] + '33'; // Add 20% opacity
  };

  // Return null if no data to render
  if (!data || data.length === 0 || !dataKeys || dataKeys.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-center text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Render line chart
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />}
          <XAxis 
            dataKey={xAxisKey} 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            labelStyle={{ marginBottom: '4px', fontWeight: 'bold' }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '10px' }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getStroke(index)}
              strokeWidth={2}
              dot={{ r: 3, fill: getStroke(index) }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name={key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Render area chart
  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />}
          <XAxis 
            dataKey={xAxisKey} 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            labelStyle={{ marginBottom: '4px', fontWeight: 'bold' }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="square"
              iconSize={8}
              wrapperStyle={{ paddingTop: '10px' }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getStroke(index)}
              fill={getFill(index)}
              strokeWidth={2}
              name={key}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Render bar chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />}
        <XAxis 
          dataKey={xAxisKey} 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={40}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: 'var(--foreground)' }}
          labelStyle={{ marginBottom: '4px', fontWeight: 'bold' }}
        />
        {showLegend && (
          <Legend 
            verticalAlign="top"
            height={36}
            iconType="square"
            iconSize={8}
            wrapperStyle={{ paddingTop: '10px' }}
          />
        )}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getStroke(index)}
            radius={[4, 4, 0, 0]}
            name={key}
            maxBarSize={50}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}