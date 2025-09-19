import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  AlertColor,
  AlertTitle,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import { ToasterToast, ToastVariant, useToast } from '@/hooks/use-toast';

const variantToSeverity: Record<ToastVariant | undefined, AlertColor> = {
  default: 'info',
  destructive: 'error',
  success: 'success',
  undefined: 'info',
};

const autoHideDefault = 6000;

export function MuiToaster() {
  const { toasts, dismiss } = useToast();

  const handleClose = (toast: ToasterToast) => {
    toast.onOpenChange?.(false);
    dismiss(toast.id);
  };

  return (
    <Fragment>
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={toast.open !== false}
          autoHideDuration={toast.duration ?? autoHideDefault}
          onClose={(_event, reason) => {
            if (reason === 'clickaway') return;
            handleClose(toast);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={variantToSeverity[toast.variant]}
            variant="filled"
            action={
              toast.action ?? (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => handleClose(toast)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )
            }
            onClose={() => handleClose(toast)}
            sx={{ alignItems: 'flex-start', minWidth: 320 }}
          >
            {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
            {toast.description && (
              <Typography variant="body2" sx={{ mt: toast.title ? 0.5 : 0 }}>
                {toast.description}
              </Typography>
            )}
          </Alert>
        </Snackbar>
      ))}
    </Fragment>
  );
}
