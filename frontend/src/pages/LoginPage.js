import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import Button from '../components/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { values, errors, handleChange, handleBlur, setFieldValue } = useForm({ email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(values);
      navigate('/dashboard');
    } catch (error) {
      setFieldValue('error', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Email address" value={values.email} onChange={handleChange} onBlur={handleBlur} />
            <input name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Password" value={values.password} onChange={handleChange} onBlur={handleBlur} />
          </div>
          {errors.error && <p className="text-red-500 text-sm">{errors.error}</p>}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 