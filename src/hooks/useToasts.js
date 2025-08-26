import { toast } from 'react-hot-toast';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function useToasts() {
  const { t } = useTranslation();

  const showError = useCallback((code) => {
    const msg = t(`errors.${code}`);
    toast.error(msg || t('errors.unknown'));
  }, [t]);

  const showSuccess = useCallback((key) => toast.success(t(key)), [t]);

  return { showError, showSuccess };
}
