'use client';

import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuth, getUser } from '@/lib/auth';
import { User } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
    setMounted(true);
  }, []);

  const handleLogout = () => {
    clearAuth();
    queryClient.clear(); // wipe all cached data for the previous user
    router.push('/login');
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#111111',
        color: '#ffffff',
        borderBottom: '1px solid #222',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '-0.3px',
          }}
          onClick={() => router.push('/boards')}
        >
          Kanban
        </Typography>

        {mounted && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#ffffff',
                color: '#111111',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user.name}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                border: '1px solid rgba(255,255,255,0.3)',
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
