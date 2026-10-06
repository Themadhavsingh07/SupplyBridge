'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SUPPLIER' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SUPPORT_AGENT';
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  loyaltyPoints?: number;
  cashbackBalance?: number;
  referralCode?: string;
  supplierId?: string;
  supplier?: {
    id: string;
    businessName: string;
    verificationStatus: string;
    rating: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  cartCount: number;
  location: string;
  setLocation: (loc: string) => void;
  refreshUser: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  cartCount: 0,
  location: 'Koramangala, Bengaluru (12 Min)',
  setLocation: () => {},
  refreshUser: async () => {},
  refreshCartCount: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [location, setLocation] = useState('Koramangala, Bengaluru (12 Min)');

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.ok && data.itemCount !== undefined) {
        setCartCount(data.itemCount);
      }
    } catch {
      setCartCount(0);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCartCount(0);
    window.location.href = '/login';
  };

  useEffect(() => {
    refreshUser();
    refreshCartCount();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cartCount,
        location,
        setLocation,
        refreshUser,
        refreshCartCount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
