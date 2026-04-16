'use client';

import { useState } from 'react';
import DashboardLayout from '../components/layout';
import { 
  Pencil, Trash2, AlertTriangle, Lock, Search, 
  ShieldCheck, Eye, EyeOff, Shield 
} from 'lucide-react';

// ================= INTERFACES =================
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Activo' | 'Inactivo';
}

export default function SettingsPage() {
  // ================= ESTADOS DE USUARIOS =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDisable, setUserToDisable] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ================= ESTADOS DE CONTRASEÑA =================
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Variable lista para recibir el dato del backend
  const diasDesdeUltimoCambio = 42; 

  // Lógica para mostrar error si no coinciden (solo si ya escribió algo en confirmación)
  const passwordsMatch = newPassword === confirmPassword;
  const showMismatchError = confirmPassword.length > 0 && !passwordsMatch;

  // ================= DATOS DE EJEMPLO (MOCKS) =================
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Carlos Mendoza', email: 'cmendoza@url.edu.gt', role: 'Administrador', status: 'Activo' },
    { id: 2, name: 'Ana López', email: 'alopez@url.edu.gt', role: 'Coordinador', status: 'Activo' },
    { id: 3, name: 'Luis Pérez', email: 'lperez@url.edu.gt', role: 'Docente', status: 'Inactivo' },
    { id: 4, name: 'Roberto Juárez', email: 'rjuarez@url.edu.gt', role: 'Docente', status: 'Activo' },
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ================= FUNCIONES DEL MODAL =================
  const openDisableModal = (user: User) => {
    setUserToDisable(user);
    setIsModalOpen(true);
  };

  const closeDisableModal = () => {
    setUserToDisable(null);
    setIsModalOpen(false);
  };

  const confirmDisable = () => {
    if (userToDisable) {
      setUsers(users.map(u => 
        u.id === userToDisable.id ? { ...u, status: 'Inactivo' } : u
      ));
    }
    closeDisableModal();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full relative">
        

        {/* CONTENEDOR PRINCIPAL (GRID 2 COLUMNAS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= TARJETA IZQUIERDA: CREDENCIALES ================= */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-600 p-6">
            
            {/* Título y Subtítulo */}
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Credenciales de seguridad</h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Actualice la contraseña de su cuenta</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña actual</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"} 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-3 pr-10 py-2.5 bg-gray-50 border rounded-lg text-sm outline-none transition-all ${
                      showMismatchError ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Mensaje de Error */}
                {showMismatchError && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {/* Botón de Actualizar */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={showMismatchError || !newPassword || !confirmPassword || !currentPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Lock size={18} />
                  Actualizar contraseña
                </button>
              </div>

              {/* Spoiler / Info Antivirus (Backend Ready) */}
              <div className="mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 border border-green-100 rounded-lg">
                <Shield size={16} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">
                  Último cambio hace {diasDesdeUltimoCambio} días
                </span>
              </div>

            </form>
          </div>

          {/* ================= TARJETA DERECHA: USUARIOS ================= */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-gray-800">Usuarios</h3>
              
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.status === 'Inactivo' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{user.name}</span>
                          <span className="text-xs text-gray-500 mt-0.5">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-md text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => openDisableModal(user)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                            title={user.status === 'Inactivo' ? 'Usuario Inactivo' : 'Deshabilitar'}
                            disabled={user.status === 'Inactivo'}
                          >
                            <Trash2 size={18} className={user.status === 'Inactivo' ? 'opacity-40' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No se encontraron usuarios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================= MODAL DE CONFIRMACIÓN ================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform scale-100 transition-transform">
              
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-6 border-4 border-orange-50">
                <AlertTriangle size={28} className="text-orange-500" />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">¿Deshabilitar usuario?</h3>
              <p className="text-gray-500 mb-8 px-2 leading-relaxed">
                ¿Esta seguro que deseas deshabilitar al usuario <strong>{userToDisable?.name}</strong> del sistema? Esta acción impedirá el acceso inmediato a la plataforma.
              </p>
              
              <div className="flex gap-4 justify-center w-full">
                <button 
                  onClick={closeDisableModal}
                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDisable}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                >
                  Deshabilitar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}