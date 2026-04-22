import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../../services/api';
import './Charts.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const COLORS = [
  '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
];

function AdminCharts() {
  const [usersGrowth, setUsersGrowth] = useState([]);
  const [cropsByType, setCropsByType] = useState([]);
  const [resourcesUsage, setResourcesUsage] = useState([]);
  const [activitiesStatus, setActivitiesStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [growthRes, systemRes] = await Promise.all([
          api.get('/analytics/admin/users-growth'),
          api.get('/analytics/admin/system-data')
        ]);
        
        setUsersGrowth(growthRes.data.usersGrowth || []);
        setCropsByType(systemRes.data.totalCropsByType || []);
        setResourcesUsage(systemRes.data.resourcesUsageSummary || []);
        setActivitiesStatus(systemRes.data.activitiesOverview || []);
      } catch (error) {
        console.error('Failed to load admin analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading admin charts...</div>;

  const usersLineData = {
    labels: usersGrowth.map(item => item.month),
    datasets: [{
      label: 'New Users',
      data: usersGrowth.map(item => item.usersCount),
      borderColor: '#9b59b6',
      backgroundColor: 'rgba(155, 89, 182, 0.2)',
      tension: 0.3,
      fill: true
    }]
  };

  const cropsBarData = {
    labels: cropsByType.map(c => c.name),
    datasets: [{
      label: 'Total Crops',
      data: cropsByType.map(c => c.value),
      backgroundColor: COLORS.slice(0, cropsByType.length),
    }]
  };

  const resourcesPieData = {
    labels: resourcesUsage.map(r => r.name),
    datasets: [{
      data: resourcesUsage.map(r => r.value),
      backgroundColor: COLORS.slice(0, resourcesUsage.length),
    }]
  };

  const activityDoughnutData = {
    labels: activitiesStatus.map(a => a.name),
    datasets: [{
      data: activitiesStatus.map(a => a.value),
      backgroundColor: activitiesStatus.map(a => a.name === 'completed' ? '#2ecc71' : (a.name === 'pending' ? '#e67e22' : '#3498db')),
    }]
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Total Users Growth</h3>
        <div className="chart-container bar-container">
          {usersGrowth.length > 0 ? <Line data={usersLineData} options={{ responsive: true, maintainAspectRatio: false }} /> : <p>No growth data</p>}
        </div>
      </div>

      <div className="chart-card">
        <h3>Total Crops by Type</h3>
        <div className="chart-container bar-container">
          {cropsByType.length > 0 ? <Bar data={cropsBarData} options={{ responsive: true, maintainAspectRatio: false }} /> : <p>No crop data</p>}
        </div>
      </div>

      <div className="chart-card">
        <h3>Resources Usage Summary</h3>
        <div className="chart-container pie-container">
          {resourcesUsage.length > 0 ? <Pie data={resourcesPieData} /> : <p>No resource data</p>}
        </div>
      </div>

      <div className="chart-card">
        <h3>System Activities Overview</h3>
        <div className="chart-container pie-container">
          {activitiesStatus.length > 0 ? <Doughnut data={activityDoughnutData} /> : <p>No activity data</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminCharts;
