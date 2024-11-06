import { useAuth } from '../context/AuthContext';

const Permissao = ({ modulo, permissao, ehAdmin, children }) => {
  const { decodedToken } = useAuth(); // Dados do token, incluindo ehAdmin e permissoes

  // Verifica se o usuário é admin e a prop ehAdmin é true
  if (ehAdmin && decodedToken?.perfil?.ehAdmin) {
    return children;
  }

  // Caso contrário, segue a lógica de módulos e permissões
  const moduloPermitido = decodedToken?.modulos?.find((m) => m.id === modulo);
  const permissaoPermitida = moduloPermitido?.permissoes?.includes(permissao);

  if (modulo && permissao && permissaoPermitida) {
    return children;
  }

  return null; // Oculta o conteúdo se não atender aos requisitos
};

export default Permissao;

// modelo de uso para usar em itens

// Exibe o link somente para administradores
// <Permissao ehAdmin>
//   <NavLink to="/configuracoes" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
//     Configurações
//   </NavLink>
// </Permissao>

// Exibe o link para usuários com permissões específicas
// <Permissao modulo="usuario" permissao="usuario.ver">
//   <NavLink to="/usuarios" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
//     Usuários
//   </NavLink>
// </Permissao> 