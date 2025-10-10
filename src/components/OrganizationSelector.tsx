import {
    ArrowRightIcon,
    BuildingOfficeIcon,
    CheckIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Organization, useOrganization } from '../contexts/OrganizationContext';

interface OrganizationSelectorProps {
    onOrganizationSelected?: (organization: Organization) => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
    onOrganizationSelected
}) => {
    const auth = useAuth();
    const {
        availableOrganizations,
        currentOrganization,
        switchOrganization,
        isLoading
    } = useOrganization();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(currentOrganization);
    const [isChanging, setIsChanging] = useState(false);

    // Filtrar organizations baseado na busca
    const filteredOrganizations = availableOrganizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.displayName && org.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectOrganization = async (organization: Organization) => {
        if (isChanging) return;

        try {
            setIsChanging(true);
            await switchOrganization(organization);

            if (onOrganizationSelected) {
                onOrganizationSelected(organization);
            }
        } catch (error) {
            console.error('Erro ao trocar de organization:', error);
        } finally {
            setIsChanging(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-sm text-gray-600">Carregando organizations...</p>
            </div>
        );
    }

    if (availableOrganizations.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Nenhuma organization disponível
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Você não tem acesso a nenhuma organization no momento.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-primary-600" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Selecione uma Organization
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Escolha a organization que você deseja acessar
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar organization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Organizations List */}
                    <div className="space-y-3">
                        {filteredOrganizations.map((organization) => {
                            const isSelected = selectedOrg?.id === organization.id;
                            const isCurrent = currentOrganization?.id === organization.id;

                            return (
                                <button
                                    key={organization.id}
                                    onClick={() => setSelectedOrg(organization)}
                                    disabled={isChanging}
                                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${isSelected
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">
                                                {organization.displayName || organization.name}
                                            </p>
                                            {organization.displayName && organization.displayName !== organization.name && (
                                                <p className="text-xs text-gray-500">{organization.name}</p>
                                            )}
                                            {isCurrent && (
                                                <p className="text-xs text-primary-600 font-medium">Atual</p>
                                            )}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <CheckIcon className="h-5 w-5 text-primary-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filteredOrganizations.length === 0 && searchTerm && (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-500">
                                Nenhuma organization encontrada para "{searchTerm}"
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex space-x-3">
                        <button
                            onClick={() => auth.signoutRedirect()}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Sair
                        </button>

                        <button
                            onClick={() => selectedOrg && handleSelectOrganization(selectedOrg)}
                            disabled={!selectedOrg || isChanging}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isChanging ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Trocando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continuar</span>
                                    <ArrowRightIcon className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSelector;

