'use client';

import Toast from '../components/toast';
import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout';
import "./setting.css"
import { 
  Trash2, AlertTriangle, Lock, Search, 
  ShieldCheck, Eye, EyeOff, UserCheck, CheckCircle
} from 'lucide-react';
import { getSystemUsers, toggleUserStatus } from '../services/userService';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Activo' | 'Inactivo';
}

export default function SettingsPage() {
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isEnableModalOpen, setIsEnableModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const showMismatchError = confirmPassword.length > 0 && !passwordsMatch;

  const [toast, setToast] = useState({ 
    show: false, 
    message: '', 
    type: 'success' as 'success' | 'error' | 'info' 
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    // Se cierra automáticamente después de 4 segundos
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };



  // ================= CARGA INICIAL DE USUARIOS =================
  useEffect(() => {
    const fetchUsers = async () => {
      const dbUsers = await getSystemUsers();
      const formattedUsers = dbUsers.map((u: any) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`.trim() || u.username,
        email: u.email,
        role: u.rol || 'Usuario',
        status: u.is_active ? 'Activo' : 'Inactivo'
      }));
      setUsers(formattedUsers);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ================= MODAL DESHABILITAR =================
  const openDisableModal = (user: User) => {
    setSelectedUser(user);
    setIsDisableModalOpen(true);
  };
  const closeDisableModal = () => {
    setSelectedUser(null);
    setIsDisableModalOpen(false);
  };

  const confirmDisable = async () => {
    if (selectedUser) {
      const response = await toggleUserStatus(selectedUser.id);
      if (response && response.status_text) {
        setUsers(users.map(u => 
          u.id === selectedUser.id ? { ...u, status: 'Inactivo' } : u
        ));
        showNotification(`Usuario ${selectedUser.name} deshabilitado con éxito`, "success");
      } else {
        showNotification("Error al intentar deshabilitar el usuario", "error");
      }
    }
    closeDisableModal();
  };

  // ================= MODAL HABILITAR =================
  const openEnableModal = (user: User) => {
    setSelectedUser(user);
    setIsEnableModalOpen(true);
  };
  const closeEnableModal = () => {
    setSelectedUser(null);
    setIsEnableModalOpen(false);
  };

  const confirmEnable = async () => {
    if (selectedUser) {
      const response = await toggleUserStatus(selectedUser.id);
      if (response && response.status_text) {
        setUsers(users.map(u => 
          u.id === selectedUser.id ? { ...u, status: 'Activo' } : u
        ));
        showNotification(`Usuario ${selectedUser.name} habilitado con éxito`, "success");
      } else {
        showNotification("Error al intentar habilitar el usuario", "error");
      }
    }
    closeEnableModal();
  };;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordUpdated(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setIsPasswordUpdated(false), 4000);
  };

  return (
    <DashboardLayout>
      <div className="settings-container">

        <div className="settings-grid">

          {/* LEFT */}
          <div className="card card-left">

            <div className="card-header">
              <div className="icon-box">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="card-title">Credenciales de seguridad</h3>
                <p className="card-subtitle">
                  Actualice la contraseña de su cuenta
                </p>
              </div>
            </div>

            <form className="form" onSubmit={handleUpdatePassword}>

              {/* PASSWORD ACTUAL */}
              <div>
                <label className="label">Contraseña actual</label>
                <div className="input-wrapper">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {/* NUEVA PASSWORD */}
              <div>
                <label className="label">Nueva contraseña</label>
                <div className="input-wrapper">
                  <input
                    type={showNew ? "text" : "password"}
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="label">Confirmar contraseña</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`input ${showMismatchError ? 'input-error' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>

                {showMismatchError && (
                  <p className="error-text">
                    <AlertTriangle size={12}/> Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {/* SUCCESS */}
              {isPasswordUpdated && (
                <div className="success-box">
                  <CheckCircle size={18}/>
                  <span className="success-text">
                    ¡Contraseña actualizada!
                  </span>
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="btn-primary"
                disabled={
                  showMismatchError ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                <Lock size={18}/> Actualizar contraseña
              </button>

            </form>
          </div>

          {/* RIGHT */}
          <div className="card card-right">

            <div className="users-header">
              <h3 className="card-title">Usuarios</h3>

              <div className="search-wrapper">
                <Search size={16} className="search-icon"/>
                <input
                  className="search-input"
                  placeholder="Buscar usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(user => (
                    <tr
                      key={user.id}
                      className={`table-row ${user.status === 'Inactivo' ? 'inactive' : ''}`}
                    >
                      <td>
                        <strong>{user.name}</strong><br/>
                        <small>{user.email}</small>
                      </td>

                      <td>
                        <span className="role">{user.role}</span>
                      </td>

                      <td>
                        <div className="actions">

                          {/* ENABLE */}
                          <button
                            className="icon-btn green"
                            onClick={() => openEnableModal(user)}
                            disabled={user.status === 'Activo'}
                            title={
                              user.status === 'Activo'
                                ? 'Ya está activo'
                                : 'Habilitar usuario'
                            }
                          >
                            <UserCheck size={18}/>
                          </button>

                          {/* DISABLE */}
                          <button
                            className="icon-btn red"
                            onClick={() => openDisableModal(user)}
                            disabled={user.status === 'Inactivo'}
                            title={
                              user.status === 'Inactivo'
                                ? 'Ya está inactivo'
                                : 'Deshabilitar usuario'
                            }
                          >
                            <Trash2 size={18}/>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* MODAL DISABLE */}
        {isDisableModalOpen && (
          <div className="modal">
            <div className="modal-box">

              <div className="modal-icon orange">
                <AlertTriangle size={28}/>
              </div>

              <h3 className="modal-title">¿Deshabilitar usuario?</h3>

              <p className="modal-text">
                ¿Seguro que deseas deshabilitar a <strong>{selectedUser?.name}</strong>?
              </p>

              <div className="modal-actions">
                <button className="btn-outline" onClick={closeDisableModal}>
                  Cancelar
                </button>

                <button className="btn-danger" onClick={confirmDisable}>
                  Deshabilitar
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL ENABLE */}
        {isEnableModalOpen && (
          <div className="modal">
            <div className="modal-box">

              <div className="modal-icon green">
                <CheckCircle size={28}/>
              </div>

              <h3 className="modal-title">¿Habilitar usuario?</h3>

              <p className="modal-text">
                ¿Seguro que deseas habilitar a <strong>{selectedUser?.name}</strong>?
              </p>

              <div className="modal-actions">
                <button className="btn-outline" onClick={closeEnableModal}>
                  Cancelar
                </button>

                <button className="btn-success" onClick={confirmEnable}>
                  Habilitar
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      <Toast
        show={toast.show}
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </DashboardLayout>
  );
}