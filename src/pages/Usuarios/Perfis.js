// Perfil.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Search, PlusCircle, ArrowRight, ArrowUp, AlertTriangle, ThumbsUp } from 'react-feather';
import './Usuarios.css';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import Notification from '../../components/Notification/Notification';
import { useUsers } from '../../context/UsersContext';
import { format } from 'date-fns';

const Perfil = () => {
  const exclusoes = ['assinatura'];

  const { perfis, modulos, listarModulos, listarPerfis, loading, obterPerfilPorId, criarPerfil, editarPerfil, excluirPerfil } = useUsers();

  const [showCriarPerfil, setShowCriarPerfil] = useState(false);
  const [expandPerfil, setExpandPerfil] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [novoPerfil, setNovoPerfil] = useState({
    nome: '',
    ehAdmin: false,
    permissoes: [],
  });

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const filteredPerfis = perfis.filter(
    (perfil) =>
      perfil.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perfil.status || 'Ativo').toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(perfil.criadoEm), 'yyyy-MM-dd').includes(searchTerm)
  );

  useEffect(() => {
    listarModulos();
    listarPerfis();
  }, [listarModulos, listarPerfis]);

  const handleToggleExpandPerfil = async (perfil) => {
    setShowCriarPerfil(false);
    setIsEditing(true);
    if (expandPerfil === perfil.id) {
      setExpandPerfil(null);
      return;
    }

    const perfilCompleto = await obterPerfilPorId(perfil.id);
    if (perfilCompleto) {
      setNovoPerfil({
        id: perfilCompleto.id,
        nome: perfilCompleto.nome,
        ehAdmin: perfilCompleto.ehAdmin,
        permissoes: perfilCompleto.modulos || [],
      });
      setExpandPerfil(perfil.id);
    }
  };

  const handleToggleCriarPerfil = () => {
    setExpandPerfil(null);
    setShowCriarPerfil(!showCriarPerfil);
    setIsEditing(false);
    setNovoPerfil({ nome: '', ehAdmin: false, permissoes: [] });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNovoPerfil((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTogglePermissao = (moduloId, permissaoId) => {
    if (novoPerfil.ehAdmin) return; // Impede alterações caso seja admin

    setNovoPerfil((prev) => {
      const moduloExistente = prev.permissoes.find((mod) => mod.id === moduloId);

      if (moduloExistente) {
        const novasPermissoes = moduloExistente.permissoes.includes(permissaoId)
          ? moduloExistente.permissoes.filter((id) => id !== permissaoId)
          : [...moduloExistente.permissoes, permissaoId];

        const novasPermissoesModulo = novasPermissoes.length
          ? { ...moduloExistente, permissoes: novasPermissoes }
          : null;

        return {
          ...prev,
          permissoes: novasPermissoesModulo
            ? prev.permissoes.map((mod) =>
                mod.id === moduloId ? novasPermissoesModulo : mod
              )
            : prev.permissoes.filter((mod) => mod.id !== moduloId),
        };
      } else {
        return {
          ...prev,
          permissoes: [
            ...prev.permissoes,
            { id: moduloId, permissoes: [permissaoId] },
          ],
        };
      }
    });
  };

  const handleSalvarPerfil = async () => {
    if (!novoPerfil.nome) {
      setNotificationData({
        title: 'Erro',
        message: 'O nome do perfil é obrigatório.',
        icon: AlertTriangle,
        type: 'error',
      });
      setShowNotification(true);
      return;
    }

    const modulosFormatados = novoPerfil.permissoes.map((modulo) => ({
      id: modulo.id,
      permissoes: modulo.permissoes,
    }));

    const perfilData = {
      nome: novoPerfil.nome,
      ehAdmin: novoPerfil.ehAdmin,
      modulos: modulosFormatados,
    };

    const response = isEditing
      ? await editarPerfil(novoPerfil.id, perfilData)
      : await criarPerfil(perfilData);

    if (response.success) {
      setNotificationData({
        title: 'Sucesso',
        message: isEditing ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!',
        type: 'success',
        icon: ThumbsUp,
      });
      setExpandPerfil(null);
      setShowCriarPerfil(false);
      setNovoPerfil({ nome: '', ehAdmin: false, permissoes: [] });
    } else {
      setNotificationData({
        title: 'Erro',
        message: isEditing ? 'Erro ao atualizar perfil.' : 'Erro ao criar perfil.',
        secondaryMessage: response.error,
        icon: AlertTriangle,
        type: 'error',
      });
    }

    setShowNotification(true);
  };

  // Função para confirmar e excluir o perfil
  const handleConfirmarExclusao = async () => {
    if (novoPerfil.id) {
      const response = await excluirPerfil(novoPerfil.id);
      if (response.success) {
        setNotificationData({
          title: 'Sucesso',
          message: 'Perfil excluído com sucesso!',
          type: 'success',
          icon: ThumbsUp,
        });
        setExpandPerfil(null);
      } else {
        setNotificationData({
          title: 'Erro',
          message: 'Erro ao excluir o perfil.',
          secondaryMessage: response.error,
          icon: AlertTriangle,
          type: 'error',
        });
      }
      setShowNotification(true);
    }
    setConfirmarExclusao(false);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className='container-add-perfil'>
          <button onClick={handleToggleCriarPerfil} className="button-criar">
            <PlusCircle className='icon' />
            {showCriarPerfil ? 'Cancelar' : 'Criar Novo Perfil'}
          </button>
        </div>

        {(showCriarPerfil || expandPerfil) && (
          <>
            <div className={`content form-criar-perfil ${showCriarPerfil ? 'slide-down' : ''} ${expandPerfil ? 'slide-up' : ''}`}>
              <h2>{isEditing ? 'Editar Perfil' : 'Criar Perfil'}</h2>
              <div className="form-group">
                <label>Nome do Perfil</label>
                <input
                  type="text"
                  name="nome"
                  value={novoPerfil.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="permissoes-container">
                <h3>Permissões</h3>
                {loading ? (
                  <p>Carregando permissões...</p>
                ) : (
                  Object.keys(modulos).map((moduloKey) => {
                    const modulo = modulos[moduloKey];

                    if (exclusoes.includes(modulo.nome.toLowerCase())) return null;

                    return (
                      <div key={modulo.id} className="permissoes-grupo">
                        <h4>{modulo.nome}</h4>
                        {modulo.permissoes.map((perm) => (
                          <div key={perm.id} className="permissao-item">
                            <span>{perm.nome}</span>
                            <label className="switch-container">
                              <input
                                type="checkbox"
                                checked={
                                  novoPerfil.ehAdmin ||
                                  novoPerfil.permissoes.some(
                                    (mod) => mod.id === modulo.id && mod.permissoes.includes(perm.id)
                                  )
                                }
                                onChange={() => handleTogglePermissao(modulo.id, perm.id)}
                                disabled={novoPerfil.ehAdmin} // Desabilita os checkboxes se for admin
                              />
                              <span className="slider"></span>
                            </label>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="form-actions">
                <div>
                  <button onClick={() => (showCriarPerfil ? setShowCriarPerfil(false) : setExpandPerfil(null))} className="button-cancelar">
                    Cancelar
                  </button>
                  <button onClick={handleSalvarPerfil} className="button-salvar">
                    Salvar
                  </button>
                </div>
                {isEditing && (
                  <button onClick={() => setConfirmarExclusao(true)} className="button-excluir">
                    Excluir perfil
                  </button>
                )}
              </div>
            </div>
            <br />
          </>
        )}
        {!showCriarPerfil && !expandPerfil && (
          <div className="content content-table">
            <h1 className='h1-search'>
              Perfis de Usuário
              <div className='search-container-usuario'>
                <input
                  type='text'
                  placeholder='Buscar perfil'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search />
              </div>
            </h1>
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Data de Criação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerfis.map((perfil) => (
                  <tr key={perfil.id}>
                    <td>{perfil.nome}</td>
                    <td>{perfil.ehAdmin ? 'Admin' : 'Ativo'}</td>
                    <td>{format(new Date(perfil.criadoEm), 'dd/MM/yyyy')}</td>
                    <td>
                      <button onClick={() => handleToggleExpandPerfil(perfil)} className="action-button action-button-perfis">
                        {expandPerfil === perfil.id ? <ArrowUp /> : <ArrowRight />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmarExclusao && (
        <ConfirmationModal
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este perfil?"
          secondaryMessage="Esta ação não pode ser desfeita."
          onConfirm={handleConfirmarExclusao}
          onCancel={() => setConfirmarExclusao(false)}
        />
      )}

      {showNotification && (
        <Notification
          title={notificationData.title}
          message={notificationData.message}
          icon={notificationData.icon}
          type={notificationData.type}
          buttons={[
            {
              label: 'Fechar',
              onClick: () => setShowNotification(false),
            },
          ]}
        />
      )}
    </div>
  );
};

export default Perfil;