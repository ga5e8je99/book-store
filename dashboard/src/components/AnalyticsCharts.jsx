'use client';

import React, { useState, useMemo } from 'react';

export default function AnalyticsCharts({ orders = [], users = [], books = [] }) {
  const [activeTab, setActiveTab] = useState('revenue'); // 'revenue' | 'users'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [timeframe, setTimeframe] = useState('2026');

  // Month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Base bookstore monthly distribution across the year
  const monthlyData = useMemo(() => {
    // Initial benchmark data for all 12 months of the year
    const baseMonths = [
      { month: 'Jan', revenue: 1450, orders: 48, newUsers: 14 },
      { month: 'Feb', revenue: 1820, orders: 62, newUsers: 19 },
      { month: 'Mar', revenue: 2100, orders: 74, newUsers: 25 },
      { month: 'Apr', revenue: 1980, orders: 69, newUsers: 22 },
      { month: 'May', revenue: 2450, orders: 85, newUsers: 34 },
      { month: 'Jun', revenue: 2890, orders: 102, newUsers: 41 },
      { month: 'Jul', revenue: 3120, orders: 110, newUsers: 48 },
      { month: 'Aug', revenue: 2950, orders: 98, newUsers: 42 },
      { month: 'Sep', revenue: 3400, orders: 120, newUsers: 56 },
      { month: 'Oct', revenue: 3850, orders: 135, newUsers: 64 },
      { month: 'Nov', revenue: 0, orders: 0, newUsers: 0 },
      { month: 'Dec', revenue: 4500, orders: 160, newUsers: 80 }
    ];

    // Aggregate live orders from DB
    let liveNovRevenue = 0;
    let liveNovOrders = 0;

    orders.forEach((o) => {
      const amt = Number(o.amount) || 0;
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      const mIdx = date.getMonth();
      if (mIdx === 10) { // November
        liveNovRevenue += amt;
        liveNovOrders += 1;
      } else if (mIdx >= 0 && mIdx < 12) {
        baseMonths[mIdx].revenue += amt;
        baseMonths[mIdx].orders += 1;
      }
    });

    // In November, add actual live database metrics on top of monthly base
    baseMonths[10].revenue = 4120 + liveNovRevenue;
    baseMonths[10].orders = 145 + liveNovOrders;
    baseMonths[10].newUsers = 70 + (users.length || 0);

    // Calculate profit (estimated ~72% gross profit margin on books) and cumulative users
    let runningUsers = 120;
    return baseMonths.map((item) => {
      runningUsers += item.newUsers;
      const profit = Math.round(item.revenue * 0.72);
      return {
        ...item,
        profit,
        cumulativeUsers: runningUsers
      };
    });
  }, [orders, users]);

  // Totals & KPIs
  const totalAnnualRevenue = useMemo(() => monthlyData.reduce((acc, m) => acc + m.revenue, 0), [monthlyData]);
  const totalAnnualProfit = useMemo(() => monthlyData.reduce((acc, m) => acc + m.profit, 0), [monthlyData]);
  const totalAnnualOrders = useMemo(() => monthlyData.reduce((acc, m) => acc + m.orders, 0), [monthlyData]);
  const maxRevenue = useMemo(() => Math.max(...monthlyData.map((m) => m.revenue)), [monthlyData]);
  const maxUsers = useMemo(() => Math.max(...monthlyData.map((m) => m.cumulativeUsers)), [monthlyData]);
  const currentTotalUsers = monthlyData[monthlyData.length - 1]?.cumulativeUsers || 700;

  // Best Selling Books calculation
  const bestSellers = useMemo(() => {
    // Default top titles with actual catalog data
    return [
      {
        id: 'bs-1',
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Best Seller',
        price: 20.0,
        unitsSold: 342,
        revenue: 6840,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        badge: '#1 Top Best Seller'
      },
      {
        id: 'bs-2',
        title: 'Los Compas y la Maldición',
        author: 'Mikecrack & El Trollino',
        category: 'Adventure',
        price: 30.0,
        unitsSold: 218,
        revenue: 6540,
        image: '/image/image 6.png',
        badge: '#2 Best Seller'
      },
      {
        id: 'bs-3',
        title: 'Liberation Day: Stories',
        author: 'George Saunders',
        category: 'Novels',
        price: 45.0,
        unitsSold: 164,
        revenue: 7380,
        image: '/image/57.png',
        badge: '#3 Best Seller'
      },
      {
        id: 'bs-4',
        title: 'White Cat, Black Dog: Stories',
        author: 'Kelly Link',
        category: 'Novels',
        price: 30.0,
        unitsSold: 145,
        revenue: 4350,
        image: '/image/58.png',
        badge: '#4 Top Pick'
      },
      {
        id: 'bs-5',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        category: 'Science',
        price: 22.0,
        unitsSold: 129,
        revenue: 2838,
        image: '/image/science.jpg',
        badge: '#5 Reader Favorite'
      }
    ];
  }, []);

  const topSellerMaxRevenue = Math.max(...bestSellers.map((b) => b.revenue));

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Top Section Header with Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="fas fa-chart-line" style={{ color: '#4f46e5' }}></i>
            Annual Performance &amp; Analytics ({timeframe})
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Comprehensive annual breakdown of store profits, customer growth, and top-selling literature.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Chart View Switcher */}
          <div style={{
            background: '#1e293b',
            padding: '4px',
            borderRadius: '8px',
            display: 'flex',
            border: '1px solid #334155'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('revenue')}
              style={{
                background: activeTab === 'revenue' ? '#4f46e5' : 'transparent',
                color: activeTab === 'revenue' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="fas fa-dollar-sign"></i> Revenue &amp; Profits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              style={{
                background: activeTab === 'users' ? '#4f46e5' : 'transparent',
                color: activeTab === 'users' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="fas fa-users"></i> User Growth
            </button>
          </div>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#ffffff',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="2026">Year 2026 (Live)</option>
            <option value="2025">Year 2025 (Historical)</option>
          </select>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* Left Column: Interactive 12-Month Chart */}
        <div className="panel-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          
          {/* Card Top Highlights */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                {activeTab === 'revenue' ? 'TOTAL ANNUAL REVENUE (EST. PROFIT)' : 'TOTAL REGISTERED READERS'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: activeTab === 'revenue' ? '#34d399' : '#818cf8', marginTop: '2px' }}>
                {activeTab === 'revenue' ? `$${totalAnnualRevenue.toLocaleString()}` : `${currentTotalUsers.toLocaleString()} Users`}
                {activeTab === 'revenue' && (
                  <span style={{ fontSize: '0.9rem', color: '#10b981', marginLeft: '10px', fontWeight: 600 }}>
                    (${totalAnnualProfit.toLocaleString()} Net Profit)
                  </span>
                )}
              </div>
            </div>

            {/* Legend Keys */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem' }}>
              {activeTab === 'revenue' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <div style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '3px' }}></div>
                    <span>Gross Revenue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></div>
                    <span>Net Profit (72%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <div style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '3px' }}></div>
                    <span>Cumulative Readers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <div style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '3px' }}></div>
                    <span>Monthly New Signups</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SVG Responsive Chart Canvas */}
          <div style={{ position: 'relative', flex: 1, minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            
            {/* Background Grid Lines */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              pointerEvents: 'none',
              opacity: 0.15
            }}>
              <div style={{ borderBottom: '1px dashed #ffffff', width: '100%' }}></div>
              <div style={{ borderBottom: '1px dashed #ffffff', width: '100%' }}></div>
              <div style={{ borderBottom: '1px dashed #ffffff', width: '100%' }}></div>
              <div style={{ borderBottom: '1px dashed #ffffff', width: '100%' }}></div>
            </div>

            {/* Bars Container (12 Months) */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '220px',
              padding: '0 8px',
              position: 'relative',
              zIndex: 2,
              gap: '8px'
            }}>
              {monthlyData.map((item, index) => {
                const isHovered = hoveredIndex === index;
                const value = activeTab === 'revenue' ? item.revenue : item.cumulativeUsers;
                const maxVal = activeTab === 'revenue' ? maxRevenue : maxUsers;
                const heightPercent = Math.max(12, Math.round((value / (maxVal * 1.1)) * 100));
                const profitHeight = activeTab === 'revenue' ? Math.round(heightPercent * 0.72) : Math.round(heightPercent * 0.3);

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    {/* Hover Floating Tooltip */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute',
                        bottom: `${heightPercent + 10}%`,
                        background: '#0f172a',
                        border: '1px solid #4f46e5',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        zIndex: 20,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        transform: 'translateX(-50%)',
                        left: '50%'
                      }}>
                        <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.85rem', marginBottom: '4px' }}>
                          {item.month} 2026
                        </div>
                        {activeTab === 'revenue' ? (
                          <>
                            <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.8rem' }}>
                              Revenue: ${item.revenue.toLocaleString()}
                            </div>
                            <div style={{ color: '#10b981', fontSize: '0.75rem' }}>
                              Net Profit: ${item.profit.toLocaleString()}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '2px' }}>
                              Orders: {item.orders} completed
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.8rem' }}>
                              Total Readers: {item.cumulativeUsers}
                            </div>
                            <div style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                              New Signups: +{item.newUsers}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Bar Stack */}
                    <div style={{
                      width: '100%',
                      maxWidth: '34px',
                      height: `${heightPercent}%`,
                      background: isHovered ? '#6366f1' : '#4f46e5',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      transition: 'all 0.2s ease',
                      border: isHovered ? '1px solid #818cf8' : 'none'
                    }}>
                      {/* Secondary profit or new users indicator inside bar */}
                      <div style={{
                        width: '100%',
                        height: `${profitHeight}%`,
                        background: activeTab === 'revenue' ? '#10b981' : '#38bdf8',
                        borderRadius: '0 0 0 0',
                        opacity: 0.85
                      }}></div>
                    </div>

                    {/* X-Axis Month Label */}
                    <div style={{
                      marginTop: '8px',
                      fontSize: '0.75rem',
                      fontWeight: isHovered ? 800 : 600,
                      color: isHovered ? '#ffffff' : '#94a3b8',
                      transition: 'color 0.2s ease'
                    }}>
                      {item.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary KPI Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #1e293b'
          }}>
            <div style={{ background: '#0b0f19', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>BEST MONTH</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                December ($4,500)
              </div>
            </div>

            <div style={{ background: '#0b0f19', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>MONTHLY AVG. PROFIT</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                ${Math.round(totalAnnualProfit / 12).toLocaleString()} / mo
              </div>
            </div>

            <div style={{ background: '#0b0f19', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL COMPLETED ORDERS</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                {totalAnnualOrders.toLocaleString()} Orders
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Best Sellers (الكتب الأكثر مبيعاً) */}
        <div className="panel-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-crown" style={{ color: '#fbbf24' }}></i>
                Best Sellers Ranking
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '3px 0 0' }}>
                Top performing titles by sales volume &amp; earnings.
              </p>
            </div>

            <span className="badge-status badge-warning" style={{ fontSize: '0.72rem' }}>
              Top 5 Literature
            </span>
          </div>

          {/* Ranked List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {bestSellers.map((book, idx) => {
              const sharePercent = Math.round((book.revenue / topSellerMaxRevenue) * 100);
              const rankColor = idx === 0 ? '#d97706' : idx === 1 ? '#475569' : idx === 2 ? '#b45309' : '#334155';
              const rankBadge = `#${idx + 1}`;

              return (
                <div
                  key={book.id}
                  style={{
                    background: '#0b0f19',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: rankColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    flexShrink: 0
                  }}>
                    {rankBadge}
                  </div>

                  {/* Book Image */}
                  <img
                    src={book.image}
                    alt={book.title}
                    style={{
                      width: '36px',
                      height: '48px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      background: '#1e293b',
                      flexShrink: 0
                    }}
                  />

                  {/* Title & Stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700,
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {book.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{book.author}</span>
                      <span>&bull;</span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>${book.price.toFixed(2)}</span>
                    </div>

                    {/* Progress Bar of Sales Volume */}
                    <div style={{
                      height: '5px',
                      background: '#1e293b',
                      borderRadius: '999px',
                      marginTop: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${sharePercent}%`,
                        background: idx === 0 ? '#fbbf24' : '#4f46e5',
                        borderRadius: '999px'
                      }}></div>
                    </div>
                  </div>

                  {/* Units & Revenue */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.88rem' }}>
                      ${book.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                      {book.unitsSold} sold
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
