'use client';

import { Box, Container, Paper, Typography } from '@mui/material';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fafafa',
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            color="#111"
            sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}
          >
            Kanban
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Simple. Clean. Focused.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #eaeaea',
            bgcolor: '#ffffff',
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}