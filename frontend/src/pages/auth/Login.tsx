import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Aashray</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div>
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="Enter your email" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Enter your password" />
            </div>
            <div>
              <Link to="/" className="btn-primary w-full justify-center">
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
