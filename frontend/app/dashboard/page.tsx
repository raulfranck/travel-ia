'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, Map, Plus, TrendingUp } from 'lucide-react';

interface DashboardData {
  userId: string;
  trips: any[];
  stats: {
    totalTrips: number;
    totalBudget: number;
    totalSpent: number;
    savings: number;
    savingsPercent: number;
    nextTrip: { destination: string; startDate: string } | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('dashboardToken');
      
      if (!token) {
        setError('Token não encontrado. Solicite o link novamente no chat.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/dashboard/data/${token}`);
      
      if (!response.ok) {
        throw new Error('Token inválido ou expirado');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erro ao carregar dados'}</p>
          <button
            onClick={() => router.push('/chat')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar ao Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button 
            onClick={() => router.push('/chat')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Viagem
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Map className="w-6 h-6 text-blue-600" />}
            label="Viagens"
            value={data.stats.totalTrips.toString()}
            trend={`${data.trips.filter(t => t.status === 'draft').length} rascunhos`}
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            label="Gasto Total"
            value={`R$ ${data.stats.totalSpent.toLocaleString('pt-BR')}`}
            trend={`de R$ ${data.stats.totalBudget.toLocaleString('pt-BR')}`}
          />
          <StatCard
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
            label="Próxima Viagem"
            value={data.stats.nextTrip ? new Date(data.stats.nextTrip.startDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : '-'}
            trend={data.stats.nextTrip?.destination || 'Nenhuma planejada'}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
            label="Economia"
            value={`${data.stats.savingsPercent.toFixed(0)}%`}
            trend={data.stats.savings >= 0 ? `R$ ${data.stats.savings.toLocaleString('pt-BR')} economizado` : `R$ ${Math.abs(data.stats.savings).toLocaleString('pt-BR')} acima`}
          />
        </div>

        {/* Trips List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Minhas Viagens</h2>
          <div className="space-y-4">
            {data.trips.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma viagem cadastrada. Crie uma no chat!
              </p>
            ) : (
              data.trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{trend}</div>
    </div>
  );
}

function TripCard({ trip }: { trip: any }) {
  const progress = trip.estimatedBudget > 0 ? (trip.spent / trip.estimatedBudget * 100) : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{trip.destination}</h3>
          <p className="text-gray-600 text-sm">
            {new Date(trip.startDate).toLocaleDateString('pt-BR')} -{' '}
            {new Date(trip.endDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            trip.status === 'planned'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {trip.status === 'planned' ? 'Planejada' : 'Rascunho'}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Orçamento</span>
          <span className="font-semibold">
            R$ {trip.spent.toLocaleString('pt-BR')} / R$ {Number(trip.estimatedBudget || 0).toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm">
          Ver Detalhes
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm">
          Editar
        </button>
      </div>
    </div>
  );
}
