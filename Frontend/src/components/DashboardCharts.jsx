import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const getCSSVar = (varName, fallback = '#ccc') => {
  if (typeof window === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val || fallback;
};

const getThemeColors = () => ({
  primary: getCSSVar('--primary', '#644a40'),
  secondary: getCSSVar('--secondary', '#ffdfb5'),
  accent: getCSSVar('--chart-5', '#66493e'),
  destructive: getCSSVar('--destructive', '#e54d2e'),
  muted: getCSSVar('--muted-foreground', '#646464'),
  text: getCSSVar('--foreground', '#202020'),
  border: getCSSVar('--border', '#d8d8d8'),
});

const commonOptions = (colors) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 750 },
  plugins: {
    legend: { display: false }
  }
});

const NoDataOverlay = ({ message = "No data available yet" }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', zIndex: 5, pointerEvents: 'none' }}>
    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>{message}</span>
  </div>
);

export const AppointmentsTrendChart = ({ data = [] }) => {
  const colors = getThemeColors();
  const hasData = data.length > 0 && data.some(d => d.count > 0);
  
  const chartData = useMemo(() => ({
    labels: data.length > 0 ? data.map(d => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Appointments',
      data: data.length > 0 ? data.map(d => d.count) : [0, 0, 0, 0, 0, 0, 0],
      fill: true,
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
      borderWidth: 3,
      pointBackgroundColor: colors.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
    }],
  }), [data, colors.primary]);

  const options = useMemo(() => {
    const opts = commonOptions(colors);
    opts.interaction = { intersect: false, mode: 'index' };
    opts.scales = {
      x: { grid: { display: false }, ticks: { color: colors.muted, font: { family: 'Outfit', size: 10, weight: 600 } } },
      y: { beginAtZero: true, grid: { color: colors.border, borderDash: [5, 5] }, ticks: { color: colors.muted, font: { family: 'Outfit', size: 10 } } }
    };
    opts.plugins.tooltip = {
      backgroundColor: 'rgba(32, 32, 32, 0.9)',
      titleFont: { family: 'Outfit', size: 12 },
      bodyFont: { family: 'Outfit', size: 12 },
      padding: 12,
      cornerRadius: 8,
      displayColors: false
    };
    return opts;
  }, [colors]);

  return (
    <>
      {!hasData && <NoDataOverlay message="Waiting for activity data..." />}
      <Line data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
    </>
  );
};

export const DepartmentLoadChart = ({ data = [] }) => {
  const colors = getThemeColors();
  const hasData = data.length > 0 && data.some(d => d.patientCount > 0);
  
  const chartData = useMemo(() => ({
    labels: hasData ? data.map(d => d.name) : ['General'],
    datasets: [{
      data: hasData ? data.map(d => d.patientCount) : [1],
      backgroundColor: hasData 
        ? [colors.primary, '#9c847a', '#c2b2ac', '#8a6e63', '#4d3a32'] 
        : [colors.border],
      hoverOffset: 15,
      borderWidth: 0,
    }],
  }), [data, colors, hasData]);

  const options = useMemo(() => {
    const opts = commonOptions(colors);
    opts.plugins.legend = { 
      display: hasData, 
      position: 'bottom', 
      labels: { color: colors.muted, usePointStyle: true, pointStyle: 'circle', padding: 20, font: { family: 'Outfit', size: 10, weight: 600 } } 
    };
    opts.cutout = '75%';
    return opts;
  }, [colors, hasData]);

  return (
    <>
      {!hasData && <NoDataOverlay message="No department load recorded" />}
      <Doughnut data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
    </>
  );
};

export const StatusDoughnut = ({ stats = {} }) => {
  const colors = getThemeColors();
  const values = [stats.pendingAppointments || 0, stats.confirmedAppointments || 0, stats.completedAppointments || 0, stats.cancelledAppointments || 0];
  const hasData = values.some(v => v > 0);
  
  const chartData = useMemo(() => ({
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [{
      data: hasData ? values : [1],
      backgroundColor: hasData ? ['#f59e0b', colors.primary, '#10b981', '#ef4444'] : [colors.border],
      borderWidth: 4,
      borderColor: 'var(--card)',
      hoverOffset: 10
    }],
  }), [values, colors, hasData]);

  const options = useMemo(() => {
    const opts = commonOptions(colors);
    opts.cutout = '85%';
    return opts;
  }, [colors]);

  return (
    <>
      {!hasData && <NoDataOverlay message="No status distribution yet" />}
      <Doughnut data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
    </>
  );
};

export const PaymentsGrowthChart = ({ data = [] }) => {
  const colors = getThemeColors();
  const hasData = data.length > 0 && data.some(d => d.revenue > 0);
  
  const chartData = useMemo(() => ({
    labels: data.length > 0 ? data.map(d => d.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ 
      label: 'Revenue (₹)', 
      data: data.length > 0 ? data.map(d => d.revenue) : [0, 0, 0, 0, 0, 0], 
      backgroundColor: colors.primary, 
      borderRadius: 8,
      hoverBackgroundColor: colors.primary + 'dd',
      barThickness: 24,
    }]
  }), [data, colors.primary]);

  const options = useMemo(() => {
    const opts = commonOptions(colors);
    opts.scales = {
      x: { grid: { display: false }, ticks: { color: colors.muted, font: { family: 'Outfit', size: 10, weight: 600 } } },
      y: { 
        beginAtZero: true, 
        grid: { color: colors.border, borderDash: [5, 5] }, 
        ticks: { 
          color: colors.muted, 
          font: { family: 'Outfit', size: 10 },
          callback: (v) => `₹${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`
        } 
      }
    };
    return opts;
  }, [colors]);

  return (
    <>
      {!hasData && <NoDataOverlay message="No revenue trends detected" />}
      <Bar data={chartData} options={options} style={{ width: '100%', height: '100%' }} />
    </>
  );
};



export const BranchPerformanceChart = ({ data = [] }) => {
  const colors = getThemeColors();
  const chartData = useMemo(() => ({
    labels: data.map(d => d.branchName),
    datasets: [{ label: 'Revenue (₹)', data: data.map(d => d.estimatedRevenue), backgroundColor: colors.primary, borderRadius: 8 }]
  }), [data, colors.primary]);
  const options = useMemo(() => {
    const opts = commonOptions(colors);
    opts.indexAxis = 'y';
    opts.plugins.legend.display = true;
    opts.scales = { x: { grid: { color: colors.border } }, y: { grid: { display: false } } };
    return opts;
  }, [colors]);
  return <Bar data={chartData} options={options} style={{ width: '100%', height: '100%' }} />;
};
