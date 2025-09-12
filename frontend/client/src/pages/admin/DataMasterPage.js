import React, { useState } from 'react';
import './DataMasterPage.css';
import JenjangPendidikanTab from './tabs/JenjangPendidikanTab';
import JabatanTab from './tabs/JabatanTab';
import TingkatanTab from './tabs/TingkatanTab'; // <-- Impor Tab Baru
import { FaChevronDown, FaGraduationCap, FaUserTie, FaLayerGroup } from 'react-icons/fa';

const TabPanel = ({ children, value, index }) => {
    return (
        <div hidden={value !== index}>
            {value === index && <div className="tab-content">{children}</div>}
        </div>
    );
};

const DataMasterPage = () => {
    const [activeTab, setActiveTab] = useState(0); // Default ke Tingkatan

    const tabs = [
        { label: 'Tingkatan Kelas', component: <TingkatanTab />, icon: <FaLayerGroup /> },
        { label: 'Jabatan', component: <JabatanTab />, icon: <FaUserTie /> },
        { label: 'Jenjang Pendidikan', component: <JenjangPendidikanTab />, icon: <FaGraduationCap /> },
    ];

    const handleDropdownChange = (event) => {
        setActiveTab(parseInt(event.target.value, 10));
    };

    return (
        <div className="data-master-container">
            <h1>Data Master</h1>
            <p>Kelola data referensi statis yang digunakan di seluruh sistem.</p>

            <div className="tabs-container">
                <div className="tabs-header">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            className={activeTab === index ? 'active' : ''}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="tabs-dropdown-container">
                    <select
                        className="tabs-dropdown"
                        value={activeTab}
                        onChange={handleDropdownChange}
                    >
                        {tabs.map((tab, index) => (
                            <option key={index} value={index}>
                                {tab.label}
                            </option>
                        ))}
                    </select>
                    <FaChevronDown className="dropdown-arrow" />
                </div>

                <div className="tabs-body">
                    {tabs.map((tab, index) => (
                        <TabPanel key={index} value={activeTab} index={index}>
                            {tab.component}
                        </TabPanel>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataMasterPage;

