import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Typography
} from '@mui/material';
import { useApi } from 'contexts/AxiosContext';

const DEFAULT_YEAR = 2025;

function AccountSelector({
  value = null,
  onChange,
  year = DEFAULT_YEAR,
  group = null,
  disabled = false,
  placeholder = 'Buscar por código o descripción',
  allowHeaders = false,
  label = 'Cuenta contable',
  required = false,
  error = false,
  helperText = '',
  scopeType,
  scopeId
}) {
  const { api } = useApi();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const isCodeSelected = useMemo(() => {
    return Boolean(value && typeof value === 'string' && value.trim().length > 0);
  }, [value]);

  useEffect(() => {
    if (disabled) return undefined;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.append('year', String(Number(year) || DEFAULT_YEAR));
      params.append('limit', '50');
      if (group) params.append('group', group);
      if (inputValue.trim()) params.append('q', inputValue.trim());
      if (scopeType) params.append('scopeType', scopeType);
      if (scopeId) params.append('scopeId', scopeId);

      setLoading(true);
      setFetchError('');
      api.get(`/api/accounts/search?${params.toString()}`)
        .then((response) => {
          const rows = response.data?.results || [];
          const filteredRows = allowHeaders ? rows : rows.filter((row) => !row.is_header);
          setOptions(filteredRows);
        })
        .catch((err) => {
          setOptions([]);
          setFetchError(err?.response?.data?.message || err.message || 'Error al buscar cuentas');
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [api, inputValue, year, group, allowHeaders, disabled, scopeType, scopeId]);

  useEffect(() => {
    if (!isCodeSelected) {
      setSelectedOption(null);
      return;
    }

    const directMatch = options.find((item) => item.code === value);
    if (directMatch) {
      setSelectedOption(directMatch);
      return;
    }

    let active = true;
    const params = new URLSearchParams();
    params.append('year', String(Number(year) || DEFAULT_YEAR));
    params.append('q', String(value));
    params.append('limit', '10');
    if (group) params.append('group', group);
    if (scopeType) params.append('scopeType', scopeType);
    if (scopeId) params.append('scopeId', scopeId);

    api.get(`/api/accounts/search?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        const rows = response.data?.results || [];
        const exact = rows.find((row) => row.code === value) || null;
        if (!exact) return;
        setSelectedOption(exact);
        setOptions((prev) => {
          if (prev.some((row) => row.code === exact.code)) return prev;
          return [exact, ...prev];
        });
      })
      .catch(() => {
        if (!active) return;
        setSelectedOption(null);
      });

    return () => {
      active = false;
    };
  }, [api, value, options, year, group, isCodeSelected, scopeType, scopeId]);

  const helper = fetchError || helperText;

  return (
    <Box>
      <Autocomplete
        disabled={disabled}
        options={options}
        value={selectedOption}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_, nextValue) => setInputValue(nextValue)}
        onChange={(_, option) => {
          setSelectedOption(option || null);
          onChange?.(option?.code || null, option || null);
        }}
        isOptionEqualToValue={(option, selected) => option.code === selected.code}
        getOptionLabel={(option) => `${option.code} - ${option.description}`}
        noOptionsText={fetchError ? 'No se pudieron cargar resultados' : 'Sin resultados'}
        clearOnEscape
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={Boolean(error || fetchError)}
            helperText={helper}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.code} sx={{ display: 'block' }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography fontWeight={700}>{option.code}</Typography>
              <Chip
                size="small"
                label={option.is_header ? 'Titular' : 'Detalle'}
                color={option.is_header ? 'warning' : 'success'}
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {option.group}
              </Typography>
            </Box>
            <Typography variant="body2">{option.description}</Typography>
            {(option.parent_code || option.level) && (
              <Typography variant="caption" color="text.secondary">
                {`Nivel ${option.level || '-'}${option.parent_code ? ` · Padre ${option.parent_code}` : ''}`}
              </Typography>
            )}
          </Box>
        )}
      />
      {!allowHeaders && (
        <Alert severity="info" sx={{ mt: 1, py: 0 }}>
          Solo se pueden seleccionar cuentas detalle.
        </Alert>
      )}
    </Box>
  );
}

export default AccountSelector;
