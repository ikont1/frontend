import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'react-feather';

export const formatFunctions = {
  cpfCnpj: value => {
    const numbers = value.replace(/\D/g, '').slice(0, 14);
    if (numbers.length <= 11) {
      return {
        formatted: numbers.replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2'),
        raw: numbers
      };
    } else {
      return {
        formatted: numbers.replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2'),
        raw: numbers.slice(0, 14)
      };
    }
  },
  cep: value => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    return {
      formatted: numbers.replace(/^(\d{5})(\d)/, '$1-$2'),
      raw: numbers
    };
  },
  telefone: value => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return {
      formatted: numbers.replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2'),
      raw: numbers
    };
  },
  email: value => {
    return {
      formatted: value,
      raw: value
    };
  },
  data: value => {
    const numbers = value.replace(/\D/g, '').slice(0, 8); // Data tem 8 dígitos (DDMMYYYY)
    return {
      formatted: numbers
        .replace(/^(\d{2})(\d{2})(\d{4})$/, '$1/$2/$3'),
      raw: numbers
    };
  },
  valor: value => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers
      .replace(/(\d{2})$/, ',$1')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return {
      formatted,
      raw: numbers.slice(0, -2) + '.' + numbers.slice(-2)   // Converte para o formato de número
    };
  },
  senha: value => {
    return {
      formatted: value,
      raw: value
    };
  }
};

const validatePassword = value => {
  if (value.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres.";
  }
  if (!/[A-Z]/.test(value)) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }
  if (!/[0-9]/.test(value)) {
    return "A senha deve conter pelo menos um número.";
  }
  if (!/[!@#$%^&*]/.test(value)) {
    return "A senha deve conter pelo menos um caractere especial (ex.: !@#$%^&*).";
  }
  return '';
};

const validateFunctions = {
  cpfCnpj: value => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 11 || numbers.length === 14;
  },
  cep: value => /^\d{5}-\d{3}$/.test(value),
  telefone: value => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value),
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  data: value => /^\d{2}\/\d{2}\/\d{4}$/.test(value),
  valor: value => /^\d{1,3}(\.\d{3})*,\d{2}$/.test(value), // Valida o formato 1.000,00
  senha: value => !validatePassword(value) // Retorna true se não houver erros
};

export const FormattedInput = ({ type, placeholder, value, onChange, name, readOnly, onBlur, required }) => {
  const [displayValue, setDisplayValue] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setDisplayValue(value ? formatFunctions[type](value).formatted : '');
  }, [value, type]);

  const handleChange = event => {
    const { formatted, raw } = formatFunctions[type](event.target.value);
    setDisplayValue(formatted);
    onChange({ target: { name, value: raw, type: 'text' } });

    if (type === 'senha') {
      const passwordError = validatePassword(raw);
      setError(passwordError);
    } else {
      const isValid = validateFunctions[type](formatted);
      setError(isValid ? '' : `O ${name} não é válido.`);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="input-wrapper">
        <input
          className='inputformated'
          type={type === 'senha' && showPassword ? 'text' : type === 'senha' ? 'password' : 'text'}
          name={name}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          onBlur={onBlur}
          readOnly={readOnly}
          required={required}
        />
        {type === 'senha' && (
          showPassword ? (
            <EyeOff className="fa" onClick={togglePasswordVisibility} aria-hidden="true" />
          ) : (
            <Eye className="fa" onClick={togglePasswordVisibility} aria-hidden="true" />
          )
        )}
      </div>
      {error && <span style={{ color: 'red', fontSize: '10px' }}>{error}</span>}
    </div>
  );
};
