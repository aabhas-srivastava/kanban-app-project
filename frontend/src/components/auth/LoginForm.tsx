'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, TextField, Button, Typography, Link as MuiLink, Alert } from '@mui/material';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { AuthResponse } from '@/types';

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      queryClient.clear(); // clear any previous user's cached data before setting new auth
      setAuth(data.accessToken, data.refreshToken, data.user);
      router.push('/boards');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required margin="normal" />
      <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required margin="normal" />
      <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 2 }}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <Typography align="center" variant="body2">
        Don&apos;t have an account? <MuiLink component={Link} href="/signup">Sign up</MuiLink>
      </Typography>
    </Box>
  );
}
