import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WebDiário Student Portal
              </h1>
              <p className="text-gray-600">
                Bem-vindo, {user?.nome || user?.username}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Info Card */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informações do Estudante
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Nome:</span> {user?.nome || 'N/A'}</p>
                <p><span className="font-medium">Login:</span> {user?.username || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {user?.email || 'N/A'}</p>
                <p><span className="font-medium">ID:</span> {user?.id || 'N/A'}</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  Ver Notas
                </button>
                <button className="w-full btn-primary">
                  Ver Frequência
                </button>
                <button className="w-full btn-primary">
                  Ver Calendário
                </button>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Atividade Recente
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Portal do estudante em desenvolvimento...
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bem-vindo ao WebDiário Student Portal
              </h2>
              <p className="text-gray-600 mb-4">
                Este é o portal dedicado aos estudantes do WebDiário. Aqui você pode acessar suas notas, 
                frequência, calendário acadêmico e outras informações importantes sobre seus estudos.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800">
                  <strong>Status:</strong> Portal em desenvolvimento. Em breve você terá acesso a todas as funcionalidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
