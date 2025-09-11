import React, { useState } from 'react';
import './DataMasterPage.css';
import JenjangPendidikanTab from './tabs/JenjangPendidikanTab';
import JabatanTab from './tabs/JabatanTab';
import { FaChevronDown } from 'react-icons/fa';

const TabPanel = ({ children, value, index }) => {
    const panelId = `tabpanel-${index}`;
    const tabId = `tab-${index}`;
    return (
        <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={value !== index}
            aria-hidden={value !== index}
        >
            {value === index && <div className="tab-content">{children}</div>}
        </div>
    );
};

const DataMasterPage = () => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { label: 'Jenjang Pendidikan', component: <JenjangPendidikanTab /> },
        { label: 'Jabatan', component: <JabatanTab /> },
        { label: 'Daftar Agama', component: <div><h3>Manajemen Daftar Agama</h3><p>Fitur ini sedang dalam pengembangan.</p></div> },
        { label: 'Kewarganegaraan', component: <div><h3>Manajemen Kewarganegaraan</h3><p>Fitur ini sedang dalam pengembangan.</p></div> },
    ];

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    const handleDropdownChange = (event) => {
        setActiveTab(parseInt(event.target.value, 10));
    };

    return (
        <div className="data-master-container">
            <h1>Data Master</h1>
            <p>Kelola data referensi statis yang digunakan di seluruh sistem.</p>

            <div className="tabs-container">
                {/* Tampilan Tab untuk Desktop */}
                <div className="tabs-header" role="tablist" aria-label="Data master tabs">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            type="button"                               // penting: hindari submit default
                            id={`tab-${index}`}
                            role="tab"
                            aria-selected={activeTab === index}
                            aria-controls={`tabpanel-${index}`}
                            className={activeTab === index ? 'active' : ''}
                            onClick={() => handleTabChange(index)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tampilan Dropdown untuk Mobile */}
                <div className="tabs-dropdown-container">
                    <select
                        className="tabs-dropdown"
                        value={activeTab}
                        onChange={handleDropdownChange}
                        aria-label="Pilih tab"
                    >
                        {tabs.map((tab, index) => (
                            <option key={index} value={index}>
                                {tab.label}
                            </option>
                        ))}
                    </select>
                    <FaChevronDown className="dropdown-arrow" />
                </div>

                {/* Konten Tab */}
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
