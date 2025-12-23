import React, { useState, useEffect } from "react";
import { BarChart3, Users, Calendar, MessageSquare, FileText, Receipt } from "lucide-react";
import { usePermanentDelete } from "../../hooks/usePermanentDelete";

const PermanentDeleteStats = () => {
  const { getStats, loading, error } = usePermanentDelete();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Błąd podczas pobierania statystyk: {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Anulowane wizyty',
      value: stats.cancelledAppointments || 0,
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      label: 'Zakończone wizyty',
      value: stats.completedAppointments || 0,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Usunięte wiadomości',
      value: stats.softDeletedContacts || 0,
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: 'Anulowane faktury',
      value: stats.cancelledInvoices || 0,
      icon: Receipt,
      color: 'bg-red-100 text-red-600'
    },
    {
      label: 'Opłacone faktury',
      value: stats.paidInvoices || 0,
      icon: Receipt,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Usunięte konta',
      value: stats.softDeletedUsers || 0,
      icon: Users,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="text-teal-700 mr-3" size={24} />
        <h2 className="text-xl font-bold text-teal-700">Statystyki trwałego usuwania</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`${stat.color} p-2 rounded-lg`} size={24} />
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Uwaga:</strong> Te statystyki pokazują liczbę rekordów, które mogą zostać trwale usunięte. 
          Operacje usuwania są nieodwracalne.
        </p>
      </div>
    </div>
  );
};

export default PermanentDeleteStats;



