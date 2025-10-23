import React, { useState, useEffect, useRef } from 'react';
import { getDashboardStats, getSignupDataForChart, getRevenueDataForChart } from '../services/adminService';
import type { AdminDashboardStats, ChartData } from '../services/adminService';
import type { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center gap-4">
        <div className="bg-brand-accent/20 p-3 rounded-lg">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
    </div>
);

const LineChart: React.FC<{ data: ChartData[]; title: string; gradientColors: [string, string]; prefix?: string }> = ({ data, title, gradientColors, prefix = '' }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartData } | null>(null);
    
    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yMax = maxValue === 0 ? 1 : Math.ceil(maxValue * 1.1); // Add 10% ceiling, prevent 0
    
    const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => padding.top + chartHeight - (value / yMax) * chartHeight;

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(d.value)}`).join(' ');
    const areaPath = `${linePath} V${height - padding.bottom} H${padding.left} Z`;

    const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
        if (!svgRef.current) return;
        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        const index = Math.round(((x - padding.left) / chartWidth) * (data.length - 1));
        if (index >= 0 && index < data.length) {
            const point = data[index];
            setTooltip({
                x: getX(index),
                y: getY(point.value),
                data: point,
            });
        }
    };
    
    const yAxisLabels = [0, yMax/2, yMax].map(val => Math.round(val));

    return (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <svg ref={svgRef} width="100%" viewBox={`0 0 ${width} ${height}`}>
                    <defs>
                        <linearGradient id={`gradient-${gradientColors[0]}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={gradientColors[0]} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={gradientColors[1]} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>

                    {/* Y-Axis Grid and Labels */}
                    {yAxisLabels.map((label, i) => (
                        <g key={i}>
                             <line x1={padding.left} y1={getY(label)} x2={width - padding.right} y2={getY(label)} stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3,3" />
                             <text x={padding.left - 8} y={getY(label) + 4} textAnchor="end" fontSize="12" fill="#9CA3AF">{prefix}{label}</text>
                        </g>
                    ))}
                    
                    {/* X-Axis Labels */}
                    {data.map((d, i) => {
                        if (i % Math.ceil(data.length / 7) === 0) { // Show ~7 labels
                             return <text key={i} x={getX(i)} y={height - padding.bottom + 20} textAnchor="middle" fontSize="12" fill="#9CA3AF">{d.label}</text>
                        }
                        return null;
                    })}
                   
                    <path d={areaPath} fill={`url(#gradient-${gradientColors[0]})`} />
                    <path d={linePath} fill="none" stroke={gradientColors[0]} strokeWidth="2.5" />

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <circle key={i} cx={getX(i)} cy={getY(d.value)} r="3" fill={gradientColors[0]} />
                    ))}
                    
                    {/* Tooltip */}
                    {tooltip && (
                        <g>
                            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke="rgba(255, 255, 255, 0.3)" strokeDasharray="3,3"/>
                            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={gradientColors[0]} stroke="white" strokeWidth="2" />
                            <g transform={`translate(${tooltip.x + 10}, ${tooltip.y - 15})`}>
                                <rect x="-50" y="-20" width="100" height="30" rx="5" fill="rgba(13, 11, 20, 0.8)" />
                                <text x="0" y="0" textAnchor="middle" fill="white" fontSize="12">{tooltip.data.label}: {prefix}{tooltip.data.value.toLocaleString()}</text>
                            </g>
                        </g>
                    )}

                    <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="transparent" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} />
                </svg>
            </div>
        </div>
    );
};


const AdminPage: React.FC = () => {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [signupChartData, setSignupChartData] = useState<ChartData[]>([]);
    const [revenueChartData, setRevenueChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const dashboardStats = await getDashboardStats();
                setStats(dashboardStats);
                setSignupChartData(getSignupDataForChart(dashboardStats.allUsers));
                setRevenueChartData(getRevenueDataForChart(dashboardStats.allUsers));
            } catch (error) {
                console.error("Failed to load admin data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading || !stats) {
        return <div className="flex justify-center mt-10"><LoadingSpinner /></div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto opacity-0 animate-fade-in-up space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-white tracking-tight">Admin Dashboard</h2>
                <p className="mt-2 text-lg text-gray-400">Application-wide data and insights.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
                <StatCard title="Total Injury Reports" value={stats.totalReports} icon="📄" />
                <StatCard title="Total Progress Logs" value={stats.totalLogs} icon="📈" />
                <StatCard title="Total AI Chats" value={stats.totalChats} icon="💬" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart data={signupChartData} title="New Users (Last 30 Days)" gradientColors={['#00FF00', '#0d0d0d']} />
                <LineChart data={revenueChartData} title="Simulated Monthly Revenue (INR)" gradientColors={['#7C3AED', '#1F1C2C']} prefix="₹"/>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">All Registered Users</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-300 uppercase bg-white/5 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Username</th>
                                <th scope="col" className="px-6 py-3">User ID</th>
                                <th scope="col" className="px-6 py-3">Date Joined</th>
                                <th scope="col" className="px-6 py-3">Primary Injury</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200">
                            {stats.allUsers.map(user => (
                                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium">{user.username}</td>
                                    <td className="px-6 py-4 text-gray-400">{user.id}</td>
                                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{user.primaryInjury || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;