import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import Modal from '../../components/Modal/Modal';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import Notification from '../../components/Notification/Notification';
import './Usuarios.css';
import { Search, UserPlus, ThumbsUp, AlertTriangle } from 'react-feather';
import { useUsers } from '../../context/UsersContext';
import { FormattedInput } from '../../components/FormateValidateInput/FormatFunction';

const Usuarios = () => {
  const { usuarios, listarUsuarios, perfis, cadastrarUsuario, editarUsuario, deletarUsuario } = useUsers();
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [novoUsuario, setNovoUsuario] = useState({
    perfilId: null,
    nome: '',
    email: '',
    login: '',
    status: ''
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    secondaryMessage: '',
    icon: null,
    type: '',
    buttons: []
  });
  const [showNotification, setShowNotification] = useState(false);


  useEffect(() => {
    listarUsuarios();
  }, [listarUsuarios]);

  const handleNovoUsuarioChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario((prevState) => ({
      ...prevState,
      [name]: name === 'perfilId' ? parseInt(value) : value,
    }));
  };

  const handleCadastrarUsuario = async () => {
    const { perfilId, nome, email, login, status } = novoUsuario;

    // Verificação para garantir que todos os campos obrigatórios estão preenchidos
    if (!perfilId || !nome || !email || !login || !status) {
      setNotificationData({
        title: 'Erro',
        message: 'Por favor, preencha todos os campos de cadastrar.',
        icon: AlertTriangle,
        type: 'error',
      });
      setShowNotification(true);
      return; // Interrompe a execução se algum campo estiver vazio
    }
    const novoUsuarioData = {
      perfilId: novoUsuario.perfilId,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      login: novoUsuario.login,
      status: novoUsuario.status,
    };

    const response = await cadastrarUsuario(novoUsuarioData);

    if (response.success) {
      listarUsuarios();
      setShowCadastroModal(false);
      setNotificationData({
        title: 'Sucesso',
        message: 'Usuário cadastrado com sucesso!',
        icon: ThumbsUp,
        type: 'success',
      });

      setNovoUsuario({
        perfilId: null,
        nome: '',
        email: '',
        login: '',
        status: ''
      });
    } else {
      // Verifica se o erro é uma string ou um objeto de erros
      const errorMessages = Array.isArray(response.error)
        ? response.error.map((err) => err.message).join(', ')  // Tratar lista de erros
        : response.error || 'Erro desconhecido ao cadastrar usuário'; // Tratar erro único

      setNotificationData({
        title: 'Erro',
        message: 'Erro ao cadastrar usuário',
        secondaryMessage: errorMessages,
        icon: AlertTriangle,
        type: 'error',
      });
    }

    setShowNotification(true);
  };

  const handleEditUsuario = async () => {
    const usuarioData = {
      perfilId: selectedUsuario.perfilId,
      nome: selectedUsuario.nome,
      email: selectedUsuario.email,
      status: selectedUsuario.status,
    };

    const response = await editarUsuario(selectedUsuario.id, usuarioData);

    if (response.success) {
      setShowEditarModal(false);
      setNotificationData({
        title: 'Usuário Atualizado',
        message: 'Os dados do usuário foram atualizados com sucesso!',
        icon: ThumbsUp,
        type: 'success',
        buttons: [{ label: 'Fechar', onClick: () => setShowNotification(false) }],
      });
    } else {
      // Se `response.error` for um array, use `.map` para construir a mensagem detalhada
      const errorMessages = Array.isArray(response.error)
        ? response.error.map((err) => err.message).join(', ')
        : response.error || 'Erro desconhecido ao atualizar';

      setNotificationData({
        title: 'Erro',
        message: 'Erro ao atualizar os dados do usuário.',
        secondaryMessage: errorMessages,
        icon: AlertTriangle,
        type: 'error',
        buttons: [{ label: 'Fechar', onClick: () => setShowNotification(false) }],
      });
    }

    setShowNotification(true);
  };

  const handleDeleteUsuario = async () => {
    if (selectedUsuario) {
      const response = await deletarUsuario(selectedUsuario.id);

      if (response.success) {
        setNotificationData({
          title: 'Usuário Excluído',
          message: `O usuário ${selectedUsuario.nome} foi excluído com sucesso.`,
          icon: ThumbsUp,
          type: 'success',
          buttons: [{ label: 'Fechar', onClick: () => setShowNotification(false) }],
        });
        listarUsuarios();
      } else {
        setNotificationData({
          title: 'Erro ao Excluir',
          message: 'Houve um erro ao tentar excluir o usuário.',
          secondaryMessage: response.error || 'Erro desconhecido.',
          icon: AlertTriangle,
          type: 'error',
          buttons: [{ label: 'Fechar', onClick: () => setShowNotification(false) }],
        });
      }
      setShowDeleteModal(false);
      setShowNotification(true);
    }
  };

  const handleActionsClick = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const handleOpenEditarModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowEditarModal(true);
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.perfilId.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className='container-add-usuario'>
          <button onClick={() => setShowCadastroModal(true)}>
            <UserPlus className='icon' /> Cadastrar usuário
          </button>
        </div>

        <div className='content content-table'>
          <h1 className='h1-search'>
            Usuários
            <div className='search-container-usuario'>
              <input
                type='text'
                placeholder='Buscar usuário'
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
                <th>Email</th>
                <th>Status</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((usuario) => {
                  const perfilNome = perfis.find((perfil) => perfil.id === usuario.perfilId)?.nome || 'N/A';
                  return (
                    <tr key={usuario.id}>
                      <td data-label="Nome">{usuario.nome}</td>
                      <td data-label="Email">{usuario.email}</td>
                      <td data-label="Status">
                        <span className={`status-usuario ${usuario.status.toLowerCase()}`}>
                          {usuario.status.charAt(0).toUpperCase() + usuario.status.slice(1)}
                        </span>
                      </td>
                      <td data-label="Perfil">{perfilNome}</td>
                      <td data-label="Ações" className="actions">
                        <button onClick={() => handleActionsClick(usuario.id)}>...</button>
                        {activeTooltip === usuario.id && (
                          <div style={{ left: 30 }} className="tooltip">
                            <ul>
                              <li onClick={() => handleOpenEditarModal(usuario)}>Editar</li>
                              <li onClick={() => {
                                setSelectedUsuario(usuario);
                                setShowDeleteModal(true);
                              }} className="remove">Remover</li>
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan='5'>Nenhum usuário cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastrar Usuário */}
      <Modal
        isOpen={showCadastroModal}
        onClose={() => setShowCadastroModal(false)}
        title="Cadastrar Usuário"
      >
        <form>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={novoUsuario.nome}
              onChange={handleNovoUsuarioChange}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <FormattedInput
              type="email"
              id="email"
              name="email"
              value={novoUsuario.email}
              onChange={handleNovoUsuarioChange}
              placeholder="email@dominio.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <FormattedInput
              type="cpfCnpj"
              id="login"
              name="login"
              value={novoUsuario.login}
              onChange={handleNovoUsuarioChange}
              placeholder="CPF"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="perfilId">Perfil</label>
            <select
              id="perfilId"
              name="perfilId"
              value={novoUsuario.perfilId || ''}
              onChange={handleNovoUsuarioChange}
              required
            >
              <option value="">Selecione um perfil</option>
              {perfis.map((perfil) => (
                <option key={perfil.id} value={perfil.id}>
                  {perfil.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={novoUsuario.status}
              onChange={handleNovoUsuarioChange}
            >
              <option value="">Selecione</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel" onClick={() => setShowCadastroModal(false)}>
              Cancelar
            </button>
            <button type="button" className="save" onClick={handleCadastrarUsuario}>
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Editar Usuário */}
      <Modal
        isOpen={showEditarModal}
        onClose={() => setShowEditarModal(false)}
        title="Editar Usuário"
      >
        <div className="form-group">
          <label htmlFor="nome">Nome</label>
          <input
            type="text"
            id="nome"
            value={selectedUsuario?.nome}
            onChange={(e) =>
              setSelectedUsuario({ ...selectedUsuario, nome: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={selectedUsuario?.email}
            onChange={(e) =>
              setSelectedUsuario({ ...selectedUsuario, email: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="perfilId">Perfil</label>
          <select
            id="perfilId"
            name="perfilId"
            value={selectedUsuario?.perfilId || ''}
            onChange={(e) =>
              setSelectedUsuario({
                ...selectedUsuario,
                perfilId: parseInt(e.target.value),
              })
            }
          >
            <option value="">Selecione um perfil</option>
            {perfis.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.nome}
              </option>
            ))}
          </select>

        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={selectedUsuario?.status}
            onChange={(e) =>
              setSelectedUsuario({ ...selectedUsuario, status: e.target.value })
            }
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="cancel" onClick={() => setShowEditarModal(false)}>
            Cancelar
          </button>
          <button type="button" className="save" onClick={handleEditUsuario}>
            Salvar
          </button>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <ConfirmationModal
          title="Confirmar Exclusão"
          message={`Tem certeza de que deseja remover o usuário ${selectedUsuario?.nome}?`}
          secondaryMessage="Esta ação não pode ser desfeita."
          onConfirm={handleDeleteUsuario}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {/* Notificação */}
      {showNotification && (
        <Notification
          title={notificationData.title}
          message={notificationData.message}
          secondaryMessage={notificationData.secondaryMessage}
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

export default Usuarios;