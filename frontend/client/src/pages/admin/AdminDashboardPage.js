import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { 
    CalendarOutlined, UserOutlined, TeamOutlined, BookOutlined, PlusOutlined 
} from '@ant-design/icons';
import CountUp from 'react-countup';
import './AdminDashboardPage.css';

const data = [
    { name: 'Guru', Jumlah: 50 },
    { name: 'Siswa', Jumlah: 1200 },
    { name: 'Kelas', Jumlah: 35 },
    { name: 'Pelajaran', Jumlah: 15 },
];

const dashboardStats = [
    { icon: <CalendarOutlined />, title: 'Tahun Pelajaran', value: '2024/2025', isText: true, color: '#2c3e50' },
    { icon: <UserOutlined />, title: 'Jumlah Guru', value: 50, color: '#e74c3c' },
    { icon: <TeamOutlined />, title: 'Jumlah Siswa', value: 1200, color: '#f39c12' },
    { icon: <BookOutlined />, title: 'Jumlah Kelas', value: 35, color: '#2ecc71' },
    { icon: <PlusOutlined />, title: 'Ekstrakurikuler', value: 10, color: '#9b59b6' },
];

const formatter = (value) => (
  <CountUp end={value} duration={2.75} separator="," />
);

const AdminDashboardPage = () => {
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };
    
    return (
        <div className="dashboard-container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="dashboard-header"
            >
                <h1>Selamat Datang, Admin!</h1>
                <p>Anda berada di panel kontrol utama. Silakan gunakan menu di samping untuk mengelola sistem.</p>
            </motion.div>
            
            <Row gutter={[16, 16]} className="stats-row">
                {dashboardStats.map((stat, index) => (
                    <Col xs={24} sm={12} md={8} lg={4} key={index}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card 
                                hoverable
                                className="stat-card"
                                style={{ backgroundColor: stat.color }}
                            >
                                <div className="stat-content">
                                    <div className="stat-icon">{stat.icon}</div>
                                    <Statistic 
                                        title={<span className="stat-title">{stat.title}</span>} 
                                        value={stat.value} 
                                        formatter={stat.isText ? undefined : formatter}
                                        valueStyle={{ color: '#fff', fontSize: '24px' }} 
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} className="info-row">
                <Col xs={24} md={12}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <Card title="Statistik Jumlah" className="chart-card">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="Jumlah" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </Col>

                <Col xs={24} md={12}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <Card title="Informasi Penting" className="info-card">
                            <ul className="info-list">
                                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                                    - Jadwal Ujian Tengah Semester akan diumumkan minggu depan.
                                </motion.li>
                                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                                    - Rapat koordinasi guru akan dilaksanakan pada 20 September 2025.
                                </motion.li>
                                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                                    - Data siswa baru sudah diperbarui.
                                </motion.li>
                            </ul>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage;