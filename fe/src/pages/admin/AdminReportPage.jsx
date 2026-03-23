import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight, Loader2, AlertCircle, DollarSign, Calendar,
    CheckCircle, XCircle, Download, Printer, Filter,
    TrendingUp, BarChart3, PieChart as PieChartIcon, Car, FileText
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import reportService from '../../services/reportService';
import { formatPrice } from '../../utils/formatters';

/* ─── Color palette ─── */
const STATUS_COLORS = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    IN_PROGRESS: '#8b5cf6',
    ASSIGNED: '#06b6d4',
    ONGOING: '#10b981',
    COMPLETED: '#22c55e',
    RETURN_PENDING_PAYMENT: '#f97316',
    CANCELLED: '#ef4444',
};
const CHART_COLORS = ['#5fcf86', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
const STATUS_LABELS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress',
    ASSIGNED: 'Assigned',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    RETURN_PENDING_PAYMENT: 'Return Pending Payment',
    CANCELLED: 'Cancelled',
};

const fmt = (d) => d.toISOString().slice(0, 10);

const QUICK_RANGES = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '3 months', days: 90 },
    { label: '1 year', days: 365 },
];

const AdminReportPage = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [from, setFrom] = useState(fmt(thirtyDaysAgo));
    const [to, setTo] = useState(fmt(today));
    const [activeRange, setActiveRange] = useState(30);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exporting, setExporting] = useState(false);
    const reportContentRef = useRef(null);

    const fetchData = useCallback(async (fromDate, toDate) => {
        setLoading(true);
        setError('');
        try {
            const res = await reportService.getOverview(fromDate, toDate);
            setData(res);
        } catch (err) {
            console.error('Report fetch failed:', err);
            setError('Failed to load report data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(from, to);
    }, []);

    const handleApplyFilter = () => {
        setActiveRange(null);
        fetchData(from, to);
    };

    const handleQuickRange = (days) => {
        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - days);
        const f = fmt(start);
        const t = fmt(end);
        setFrom(f);
        setTo(t);
        setActiveRange(days);
        fetchData(f, t);
    };

    /* ─── Export PDF ─── */
    const handleExportPDF = async () => {
        if (!reportContentRef.current || !data) return;
        setExporting(true);

        try {
            const element = reportContentRef.current;

            // Show hidden PDF-only elements for capture
            const pdfHeader = element.querySelector('.pdf-only-header');
            const pdfSummary = element.querySelector('.pdf-summary-table');
            if (pdfHeader) pdfHeader.style.display = 'block';
            if (pdfSummary) pdfSummary.style.display = 'block';

            // Small delay to let DOM render
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc',
                logging: false,
                windowWidth: 1200,
            });

            // Hide them again
            if (pdfHeader) pdfHeader.style.display = 'none';
            if (pdfSummary) pdfSummary.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');

            // ── Content across pages ──
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                pdf.addPage();
                position = -(imgHeight - heightLeft);
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // ── Footer on each page ──
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`E-Fleet Report  •  Trang ${i}/${totalPages}`, 15, 290);
                pdf.text(`Xuat luc: ${new Date().toLocaleString('vi-VN')}`, 210 - 15, 290, { align: 'right' });
            }

            pdf.save(`bao-cao-thong-ke_${from}_${to}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
            setError('PDF export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    /* ─── Export CSV ─── */
    const handleExportCSV = () => {
        if (!data) return;
        const lines = ['Metric,Value'];
        lines.push(`Total Revenue,${data.totalRevenue}`);
        lines.push(`Total Bookings,${data.totalBookings}`);
        lines.push(`Completed,${data.completedBookings}`);
        lines.push(`Cancelled,${data.cancelledBookings}`);
        lines.push('');
        lines.push('Status,Count,Percentage (%)');
        data.statusBreakdown?.forEach(s => {
            lines.push(`${STATUS_LABELS[s.status] || s.status},${s.count},${s.percentage}`);
        });
        lines.push('');
        lines.push('Category,Brand,Revenue,Bookings');
        data.revenueByCategory?.forEach(c => {
            lines.push(`${c.categoryName},${c.brand},${c.revenue},${c.bookingCount}`);
        });
        lines.push('');
        lines.push('License Plate,Category,Brand,Bookings,Revenue');
        data.topVehicles?.forEach(v => {
            lines.push(`${v.licensePlate},${v.categoryName},${v.brand},${v.bookingCount},${v.totalRevenue}`);
        });

        const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${from}-${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ─── Render helpers ─── */

    const renderOverviewCards = () => {
        const cards = [
            {
                title: 'Total Revenue',
                value: formatPrice(data.totalRevenue || 0),
                icon: DollarSign,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200'
            },
            {
                title: 'Total Bookings',
                value: data.totalBookings || 0,
                icon: Calendar,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
            },
            {
                title: 'Completed',
                value: data.completedBookings || 0,
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            },
            {
                title: 'Cancelled',
                value: data.cancelledBookings || 0,
                icon: XCircle,
                color: 'text-red-500',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            },
        ];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((c, i) => (
                    <div key={i} className={`bg-white rounded-2xl border ${c.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${c.bgColor} p-3 rounded-xl`}>
                                <c.icon className={`h-6 w-6 ${c.color}`} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{c.value}</h3>
                        <p className="text-sm text-gray-500">{c.title}</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderStatusPieChart = () => {
        const breakdown = data.statusBreakdown || [];
        if (breakdown.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-12">No data available</p>;
        }

        const chartData = breakdown.map(s => ({
            name: STATUS_LABELS[s.status] || s.status,
            value: s.count,
            fill: STATUS_COLORS[s.status] || '#94a3b8',
        }));

        return (
            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={true}
                        >
                            {chartData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderRevenueByCategoryChart = () => {
        const cats = data.revenueByCategory || [];
        if (cats.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-12">No data available</p>;
        }

        const chartData = cats.map(c => ({
            name: `${c.brand} ${c.categoryName}`,
            revenue: c.revenue,
            bookings: c.bookingCount,
        }));

        return (
            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={140}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value, name) => {
                                if (name === 'revenue') return [formatPrice(value), 'Revenue'];
                                return [value, 'Bookings'];
                            }}
                        />
                        <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={30}>
                            {chartData.map((_, idx) => (
                                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderDailyTrendChart = () => {
        const trend = data.dailyTrend || [];
        if (trend.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-12">No data available</p>;
        }

        const chartData = trend.map(t => ({
            date: t.date,
            bookings: t.bookingCount,
            revenue: t.revenue,
        }));

        return (
            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5fcf86" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#5fcf86" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value, name) => {
                                if (name === 'revenue') return [formatPrice(value), 'Revenue'];
                                return [value, 'Bookings'];
                            }}
                        />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="bookings" name="Bookings"
                            stroke="#5fcf86" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                        <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue"
                            stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderTopVehiclesTable = () => {
        const vehicles = data.topVehicles || [];
        if (vehicles.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-8">No data available</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">Vehicle</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-600">License Plate</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-600">Bookings</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-600">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v, idx) => (
                            <tr key={v.vehicleId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${idx < 3 ? 'bg-[#5fcf86] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {idx + 1}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900">{v.brand} {v.categoryName}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-mono">{v.licensePlate}</span>
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">{v.bookingCount}</td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatPrice(v.totalRevenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    /* ─── Main render ─── */

    if (loading && !data) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5fcf86]" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6">
            {/* Breadcrumb + Title + Export Buttons */}
            <div className="mb-8 no-print">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to="/" className="hover:text-[#5fcf86]">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/admin" className="hover:text-[#5fcf86]">Admin</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Reports & Analytics</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="text-gray-500 mt-1">Booking analytics, revenue insights and fleet performance</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download size={16} />
                            CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5fcf86] to-[#3bb562] text-white rounded-xl text-sm font-semibold hover:from-[#4bb974] hover:to-[#329e56] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {exporting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <FileText size={16} />
                            )}
                            {exporting ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-8 no-print">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Date Range:</span>
                    </div>

                    {/* Quick range buttons */}
                    <div className="flex gap-2">
                        {QUICK_RANGES.map(r => (
                            <button
                                key={r.days}
                                onClick={() => handleQuickRange(r.days)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeRange === r.days
                                    ? 'bg-[#5fcf86] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <input
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5fcf86]/40 focus:border-[#5fcf86]"
                        />
                        <span className="text-gray-400">&ndash;</span>
                        <input
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5fcf86]/40 focus:border-[#5fcf86]"
                        />
                        <button
                            onClick={handleApplyFilter}
                            className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* ── PDF-capturable content area ── */}
            {data && (
                <div ref={reportContentRef}>
                    {/* PDF header (visible only inside captured area for context) */}
                    <div className="pdf-only-header" style={{ display: 'none' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #5fcf86, #3bb562)',
                            padding: '24px 32px',
                            borderRadius: '16px',
                            marginBottom: '24px',
                            color: 'white',
                        }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>E-Fleet — Reports & Analytics</h1>
                            <p style={{ fontSize: '14px', opacity: 0.9 }}>
                                Date Range: {from} — {to} &nbsp;•&nbsp; Generated: {new Date().toLocaleString('en-US')}
                            </p>
                        </div>
                    </div>

                    {/* Overview Cards */}
                    {renderOverviewCards()}

                    {/* Charts row 1: Pie + Revenue by Category */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChartIcon size={20} className="text-[#5fcf86]" />
                                <h3 className="text-lg font-bold text-gray-900">Booking Status Breakdown</h3>
                            </div>
                            {renderStatusPieChart()}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 size={20} className="text-blue-500" />
                                <h3 className="text-lg font-bold text-gray-900">Revenue by Vehicle Category</h3>
                            </div>
                            {renderRevenueByCategoryChart()}
                        </div>
                    </div>

                    {/* Charts row 2: Daily Trend (full width) */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-purple-500" />
                            <h3 className="text-lg font-bold text-gray-900">Daily Booking Trend</h3>
                        </div>
                        {renderDailyTrendChart()}
                    </div>

                    {/* Top Vehicles Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Car size={20} className="text-orange-500" />
                            <h3 className="text-lg font-bold text-gray-900">Top Rented Vehicles</h3>
                        </div>
                        {renderTopVehiclesTable()}
                    </div>

                    {/* Summary table for PDF (always rendered but hidden on screen) */}
                    <div className="pdf-summary-table" style={{ display: 'none' }}>
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>📊 Summary</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Total Revenue</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{formatPrice(data.totalRevenue || 0)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Total Bookings</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{data.totalBookings || 0}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Completed Bookings</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{data.completedBookings || 0}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Cancelled Bookings</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{data.cancelledBookings || 0}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Exporting overlay ── */}
            {exporting && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#5fcf86]" />
                        <p className="text-lg font-semibold text-gray-900">Generating PDF...</p>
                        <p className="text-sm text-gray-500">Please wait a moment</p>
                    </div>
                </div>
            )}

            {/* ── Print / PDF optimisation styles ── */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                /* Show hidden elements when capturing for PDF */
                .pdf-capture-active .pdf-only-header,
                .pdf-capture-active .pdf-summary-table { display: block !important; }
            `}</style>
        </div>
    );
};

export default AdminReportPage;
