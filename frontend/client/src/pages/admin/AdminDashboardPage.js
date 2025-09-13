import React from 'react';
import { Card, Col, Row, Statistic, Table, Avatar, List, Tag, Button, Calendar } from 'antd';
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
    TeamOutlined, 
    UserOutlined, 
    BookOutlined, 
    ArrowUpOutlined,
    ArrowDownOutlined,
    TrophyOutlined,
    BellOutlined,
    PlusOutlined,
    SettingOutlined,
    MailOutlined,
    CheckCircleOutlined,
    StarOutlined,
    SmileOutlined
} from '@ant-design/icons';

// --- CSS Styles ---
// All styles are now included directly in the component to avoid import errors.
const GlobalStyles = () => (
    <style>{`
        /* --- Global Styles & Variables --- */
        :root {
            --bg-color: #f4f7fe;
            --card-bg-color: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --primary-color: #3498db;
            --green-color: #2ecc71;
            --orange-color: #f39c12;
            --red-color: #e74c3c;
            --purple-color: #9b59b6;
            --teal-color: #1abc9c;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --border-radius: 12px;
        }

        body {
            background-color: var(--bg-color);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .dashboard-container-revamped {
            padding: 24px;
            max-width: 1600px;
            margin: auto;
        }

        /* --- Header --- */
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .dashboard-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
        }

        .dashboard-header p {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 4px 0 0 0;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }
        .header-actions .ant-btn {
            border-radius: 8px;
            font-weight: 500;
        }

        /* --- Main Stats Grid --- */
        .main-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 24px;
        }

        .stat-card-revamped {
            background: var(--card-bg-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
        }

        .stat-card-revamped:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
        }

        .stat-card-revamped .ant-card-body {
            padding: 20px !important;
        }

        .stat-card-inner {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        .stat-info .ant-statistic-title {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 4px;
        }

        .stat-info .ant-statistic-content {
            color: var(--text-primary);
            font-weight: 600;
            font-size: 24px;
        }

        .stat-trend {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
        }

        .stat-trend.positive { color: var(--green-color); }
        .stat-trend.negative { color: var(--red-color); }

        /* --- General Content Card --- */
        .content-card {
            background: var(--card-bg-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
        }
        .content-card .ant-card-head-title {
            font-weight: 600;
            color: var(--text-primary);
        }
        .content-card .ant-card-body {
            padding: 24px;
        }

        /* --- Chart Customizations --- */
        .recharts-pie-label .recharts-text {
            fill: var(--text-primary);
            font-size: 14px;
            font-weight: 600;
        }
        
        /* --- Performance Table --- */
        .performance-table .ant-table {
            border-radius: 8px;
        }
        .student-info {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
        }

        /* --- Gender Distribution --- */
        .gender-legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 16px;
            font-size: 14px;
            color: var(--text-secondary);
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .legend-item .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        /* --- Recent Activities --- */
        .activity-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-color);
            font-size: 18px;
        }
        .ant-list-item-meta-title span {
            color: var(--text-primary);
            font-weight: 500;
        }
        .ant-list-item-meta-description {
            font-size: 12px;
        }

        /* --- Calendar --- */
        .ant-picker-calendar {
            border: none;
        }
        .ant-picker-calendar .ant-picker-panel {
            border-top: 1px solid var(--border-color);
        }


        /* --- Responsive Design --- */
        @media (max-width: 768px) {
            .dashboard-container-revamped {
                padding: 16px;
            }
            .dashboard-header h1 {
                font-size: 22px;
            }
            .header-actions {
                width: 100%;
                justify-content: flex-start;
            }
        }
    `}</style>
);


// --- Mock Data ---
const mainStats = [
    { title: 'Total Siswa', value: 1250, prev: 1200, icon: <TeamOutlined />, color: '#3498db' },
    { title: 'Total Guru', value: 52, prev: 50, icon: <UserOutlined />, color: '#2ecc71' },
    { title: 'Jumlah Kelas', value: 35, prev: 35, icon: <BookOutlined />, color: '#f39c12' },
    { title: 'Lulusan 2024', value: 320, prev: 315, icon: <StarOutlined />, color: '#9b59b6' },
    { title: 'Ekstrakurikuler', value: 12, prev: 10, icon: <SmileOutlined />, color: '#1abc9c' },
];
const studentGrowthData = [
    { year: '2021', students: 800 },
    { year: '2022', students: 950 },
    { year: '2023', students: 1100 },
    { year: '2024', students: 1200 },
    { year: '2025', students: 1250 },
];
const genderData = [
    { name: 'Laki-laki', value: 750 },
    { name: 'Perempuan', value: 500 },
];
const GENDER_COLORS = ['#3498db', '#e74c3c'];
const topStudentsData = [
    { key: '1', name: 'Ahmad Subarjo', class: '12 IPA 1', score: 98.5, avatar: 'https://i.pravatar.cc/150?img=1' },
    { key: '2', name: 'Siti Aminah', class: '12 IPS 2', score: 97.2, avatar: 'https://i.pravatar.cc/150?img=2' },
    { key: '3', name: 'Budi Santoso', class: '11 IPA 3', score: 96.8, avatar: 'https://i.pravatar.cc/150?img=3' },
    { key: '4', name: 'Dewi Lestari', class: '11 IPS 1', score: 96.5, avatar: 'https://i.pravatar.cc/150?img=4' },
];
const recentActivities = [
    { title: 'Jadwal Ujian Semester Baru Telah Diterbitkan', time: '5 menit yang lalu', type: 'publish' },
    { title: 'Data 15 Siswa Baru Telah Ditambahkan', time: '1 jam yang lalu', type: 'add' },
    { title: 'Laporan Keuangan Bulan Agustus Telah Disetujui', time: '3 jam yang lalu', type: 'approve' },
    { title: 'Permintaan Cuti dari Guru Budi Hartono', time: '1 hari yang lalu', type: 'request' },
];
const extracurriculars = [
    'Pramuka', 'Paskibra', 'Sepak Bola', 'Basket', 'Voli', 'KIR', 'Paduan Suara', 'Tari Tradisional', 'English Club', 'Jurnalistik', 'Robotik', 'Taekwondo'
];

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
};

const AdminDashboardPage = () => {
    const studentColumns = [
        {
            title: 'Siswa',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="student-info">
                    <Avatar src={record.avatar} />
                    <span>{text}</span>
                </div>
            ),
        },
        { title: 'Kelas', dataIndex: 'class', key: 'class' },
        { title: 'Nilai Rata-rata', dataIndex: 'score', key: 'score', render: (score) => <Tag color="gold">{score}</Tag>},
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'publish': return <BellOutlined style={{ color: '#3498db' }} />;
            case 'add': return <PlusOutlined style={{ color: '#2ecc71' }} />;
            case 'approve': return <CheckCircleOutlined style={{ color: '#9b59b6' }} />;
            case 'request': return <MailOutlined style={{ color: '#f39c12' }} />;
            default: return <BellOutlined />;
        }
    };
    
    return (
        <div className="dashboard-container-revamped">
            <GlobalStyles />
            {/* Header */}
            <motion.div 
                className="dashboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1>Dashboard Admin</h1>
                    <p>Selamat datang kembali! Berikut adalah ringkasan aktivitas sekolah.</p>
                </div>
                 <div className="header-actions">
                    <Button icon={<PlusOutlined />}>Tambah Data</Button>
                    <Button type="primary" icon={<SettingOutlined />}>Pengaturan</Button>
                </div>
            </motion.div>

            {/* Main Stats */}
            <motion.div
                className="main-stats-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {mainStats.map((stat) => {
                    const diff = stat.value - stat.prev;
                    const isPositive = diff >= 0;
                    return (
                        <motion.div key={stat.title} variants={itemVariants}>
                            <Card className="stat-card-revamped" hoverable>
                                <div className="stat-card-inner">
                                    <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                    <div className="stat-info">
                                        <Statistic
                                            title={stat.title}
                                            value={stat.value}
                                        />
                                        <div className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
                                            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                            {Math.abs(diff)} vs sebelumnya
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Main Content Area */}
            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <motion.div variants={itemVariants}>
                            <Card className="content-card" title="Pertumbuhan Jumlah Siswa (2021-2025)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={studentGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="students" stroke="#3498db" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                           <Card className="content-card" title={<span><TrophyOutlined /> Peringkat Siswa Teratas</span>} style={{marginTop: '24px'}}>
                                <Table 
                                    dataSource={topStudentsData} 
                                    columns={studentColumns} 
                                    pagination={false}
                                    className="performance-table"
                                />
                            </Card>
                        </motion.div>
                    </motion.div>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                     <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <motion.div variants={itemVariants}>
                            <Card className="content-card" title="Distribusi Gender">
                               <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie 
                                            data={genderData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={80} 
                                            labelLine={false}
                                            label={false}
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                 <div className="gender-legend">
                                    <div className="legend-item">
                                        <span className="dot" style={{backgroundColor: GENDER_COLORS[0]}}></span> Laki-laki: {genderData[0].value}
                                    </div>
                                     <div className="legend-item">
                                        <span className="dot" style={{backgroundColor: GENDER_COLORS[1]}}></span> Perempuan: {genderData[1].value}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="content-card" title="Ekstrakurikuler Tersedia" style={{marginTop: '24px'}}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {extracurriculars.map(extra => (
                                        <Tag key={extra} color="blue">{extra}</Tag>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="content-card" title="Aktivitas Terbaru" style={{marginTop: '24px'}}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentActivities}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<div className="activity-icon">{getActivityIcon(item.type)}</div>}
                                                title={<span>{item.title}</span>}
                                                description={item.time}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="content-card" title="Kalender Akademik" style={{marginTop: '24px'}}>
                               <Calendar fullscreen={false} />
                            </Card>
                        </motion.div>
                     </motion.div>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage;

