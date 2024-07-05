import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ChevronDown, PlusCircle, ThumbsUp } from 'react-feather';
import './ClientesFornecedores.css';
import Modal from '../../components/Modal/Modal';
import ConfirmationModal from '../../components/Modal/confirmationModal';
import ClienteForm from './ClienteForm';
import FornecedorForm from './FornecedorForm';
import Notification from '../../components/Notification/Notification';

const ClientesFornecedores = () => {
  const { clientes, fornecedores, fetchClientes, fetchFornecedores, deleteCliente, deleteFornecedor } = useData();

  const [activeTab, setActiveTab] = useState('clientes');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(null);
  const [modalSize, setModalSize] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [nameToDelete, setNameToDelete] = useState('');
  const [notification, setNotification] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleActionsClick = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleAddClick = () => {
    setShowAddOptions(!showAddOptions);
  };

  useEffect(() => {
    fetchClientes({ itensPorPagina: 10, pagina: 1, ordem: 'ASC', ordenarPor: 'id' });
    fetchFornecedores({ itensPorPagina: 10, pagina: 1, ordem: 'ASC', ordenarPor: 'id' });
  }, [fetchClientes, fetchFornecedores]);

  const handleAddOptionClick = (option) => {
    setShowAddOptions(false);
    setModalTitle(`Novo ${option}`);
    if (option === 'Cliente') {
      setModalContent(
        <ClienteForm
          onClose={handleModalClose}
          fetchData={fetchClientes}
        />
      );
      setModalSize('');
    } else if (option === 'Fornecedor') {
      setModalContent(
        <FornecedorForm
          onClose={handleModalClose}
          fetchData={fetchFornecedores}
        />
      );
      setModalSize('');
    }
    setIsModalOpen(true);
  };

  const handleEditClick = (id, type) => {
    const item = type === 'cliente' ? clientes.find(c => c.id === id) : fornecedores.find(f => f.id === id);
    setModalTitle(`${type === 'cliente' ? 'Editar Cliente' : 'Editar Fornecedor'}`);
    if (type === 'cliente') {
      setModalContent(
        <ClienteForm
          initialData={item}
          onClose={handleModalClose}
          fetchData={fetchClientes}
        />
      );
      setModalSize('');
    } else {
      setModalContent(
        <FornecedorForm
          initialData={item}
          onClose={handleModalClose}
          fetchData={fetchFornecedores}
        />
      );
      setModalSize('');
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id, type) => {
    const item = type === 'cliente' ? clientes.find(c => c.id === id) : fornecedores.find(f => f.id === id);
    setItemToDelete(id);
    setTypeToDelete(type);
    setNameToDelete(item.nomeFantasia || item.razaoSocial);
    setShowConfirmationModal(true);
  };

  const confirmDelete = async () => {
    if (typeToDelete === 'cliente') {
      await deleteCliente(itemToDelete);
      fetchClientes({ itensPorPagina: 10, pagina: 1, ordem: 'ASC', ordenarPor: 'id' });
    } else if (typeToDelete === 'fornecedor') {
      await deleteFornecedor(itemToDelete);
      fetchFornecedores();
    }
    setNotification({
      title: `${typeToDelete === 'cliente' ? 'Cliente' : 'Fornecedor'} removido com sucesso!`,
      message: 'O registro foi removido.',
      type: 'success',
      icon: ThumbsUp,
      buttons: [{ label: 'Ok', onClick: handleNotificationClose }]
    });
    setShowConfirmationModal(false);
    setItemToDelete(null);
    setTypeToDelete(null);
    setNameToDelete('');
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-header">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'clientes' ? 'active' : ''}`}
              onClick={() => handleTabClick('clientes')}
            >
              Clientes
            </button>
            <button
              className={`tab ${activeTab === 'fornecedores' ? 'active' : ''}`}
              onClick={() => handleTabClick('fornecedores')}
            >
              Fornecedores
            </button>
          </div>
          <button className="add-button" onClick={handleAddClick}>
            <PlusCircle /> Adicionar <ChevronDown className='rightIcon' />
          </button>
          {showAddOptions && (
            <div className="add-options">
              <ul>
                <li onClick={() => handleAddOptionClick('Cliente')}>Cliente</li>
                <li onClick={() => handleAddOptionClick('Fornecedor')}>Fornecedor</li>
              </ul>
            </div>
          )}
        </div>

        <div className="content content-table">
          <h1>Clientes e Fornecedores</h1>
          {activeTab === 'clientes' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome / Razão Social</th>
                  <th></th>
                  <th>Inscrição Municipal</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Inscrição Estadual</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientes && clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nomeFantasia}</td>
                    <td>{cliente.razaoSocial}<br /><span>{cliente.cpfCnpj}</span></td>
                    <td>{cliente.inscricalMunicipal}</td>
                    <td>{cliente.contato}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.inscricalEstadual}</td>
                    <td data-label="Ações" className="actions">
                      <button onClick={() => handleActionsClick(cliente.id)}>...</button>
                      {activeTooltip === cliente.id && (
                        <div className="tooltip">
                          <ul>
                            <li onClick={() => handleEditClick(cliente.id, 'cliente')}>Editar</li>
                            <li onClick={() => handleDeleteClick(cliente.id, 'cliente')} className="remove">Remover</li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'fornecedores' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome / Razão Social</th>
                  <th></th>
                  <th>Inscrição Municipal</th>
                  <th>Inscrição Estadual</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fornecedores && fornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>{fornecedor.nomeFantasia}</td>
                    <td>{fornecedor.razaoSocial}<br /><span>{fornecedor.cpfCnpj}</span></td>
                    <td>{fornecedor.inscricalMunicipal}</td>
                    <td>{fornecedor.inscricalEstadual}</td>
                    <td>{fornecedor.email}</td>
                    <td>{fornecedor.telefone}</td>
                    <td data-label="Ações" className="actions">
                      <button onClick={() => handleActionsClick(fornecedor.id)}>...</button>
                      {activeTooltip === fornecedor.id && (
                        <div className="tooltip">
                          <ul>
                            <li onClick={() => handleEditClick(fornecedor.id, 'fornecedor')}>Editar</li>
                            <li onClick={() => handleDeleteClick(fornecedor.id, 'fornecedor')} className="remove">Remover</li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={modalTitle}
          size={modalSize}
        >
          {modalContent}
        </Modal>

        {showConfirmationModal && (
          <ConfirmationModal
            title="Confirmação"
            message={`Confirma que deseja remover ${nameToDelete}?`}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirmationModal(false)}
          />
        )}

        {notification && (
          <Notification
            title={notification.title}
            message={notification.message}
            secondaryMessage={notification.secondaryMessage}
            type={notification.type}
            icon={notification.icon}
            buttons={notification.buttons}
            onClose={handleNotificationClose}
          />
        )}
      </div>
    </div>
  );
};

export default ClientesFornecedores;
