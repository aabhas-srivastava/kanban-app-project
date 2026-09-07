'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Link as MuiLink, Alert } from '@mui/material';
import Link from 'next/link';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { AuthResponse } from '@/types';

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/signup', { name, email, password });
      setAuth(data.accessToken, data.refreshToken, data.user);
      router.push('/boards');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required margin="normal" />
      <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required margin="normal" />
      <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required margin="normal" helperText="Minimum 6 characters" />
      <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>
      <Typography align="center" variant="body2">
        Already have an account? <MuiLink component={Link} href="/login">Login</MuiLink>
      </Typography>
    </Box>
  );
}