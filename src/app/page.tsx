'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar entre login y registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { username:email, password:password });
      const { token } = response.data;

      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Su conexión de internet puede ser mala, intente más tarde.';
      Swal.fire(errorMessage);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5001/api/auth/register', { username:email,password:password });
      setIsRegistering(false); // Cambia a la vista de login después de registrar
      Swal.fire('Registro exitoso. Por favor, inicia sesión.');
    } catch (error: any) {
      console.log(error)
      let msg = ''
      if(error.response?.data?.message){
        msg = error.response?.data?.message
      }else{
      try {
        for(let item of error.response?.data?.errors){
          msg += ' '+item.msg;
        }
      } catch (error) {
        msg = 'Error durante el registro.'
      }
    }
      Swal.fire(msg);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={isRegistering ? handleRegister : handleLogin}
        className="flex flex-col w-80 bg-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isRegistering ? 'Register' : 'Login'}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-blue-500 hover:underline"
        >
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </form>
    </div>
  );
}
