'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Tab,
  Tabs,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Person as PersonIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { useNotification } from '@/contexts/NotificationContext'
import { brazilianStates, VALIDATION } from '@/utils/constants'
import { Address } from '@/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface ProfileFormData {
  name: string
  email: string
  phone: string
}

interface AddressFormData extends Omit<Address, 'country'> {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const { withLoading } = useAsyncOperation()
  const { showNotification } = useNotification()
  const [tabValue, setTabValue] = useState(0)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const {
    control: addressControl,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
  } = useForm<AddressFormData>({
    defaultValues: {
      street: user?.address?.street || '',
      number: user?.address?.number || '',
      complement: user?.address?.complement || '',
      neighborhood: user?.address?.neighborhood || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
    },
  })

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm<PasswordFormData>()

  const newPassword = watchPassword('newPassword')

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await withLoading(async () => {
        await updateProfile(data)
      })
      showNotification('Perfil atualizado com sucesso', 'success')
    } catch (error) {
      showNotification('Erro ao atualizar perfil', 'error')
    }
  }

  const onAddressSubmit = async (data: AddressFormData) => {
    try {
      const addressWithCountry: Address = {
        ...data,
        country: 'Brasil', // Add default country
      }
      
      await withLoading(async () => {
        await updateProfile({ address: addressWithCountry })
      })
      showNotification('Endereço atualizado com sucesso', 'success')
    } catch (error) {
      showNotification('Erro ao atualizar endereço', 'error')
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      showNotification('As senhas não coincidem', 'error')
      return
    }

    try {
      const passwordData: PasswordUpdateData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }

      await withLoading(async () => {
        await updateProfile({ passwordUpdate: passwordData })
      })
      showNotification('Senha atualizada com sucesso', 'success')
    } catch (error) {
      showNotification('Erro ao atualizar senha', 'error')
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Meu Perfil
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<PersonIcon />} label="Dados Pessoais" />
            <Tab icon={<LocationIcon />} label="Endereço" />
            <Tab icon={<LockIcon />} label="Senha" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={profileControl}
                  rules={{ 
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: VALIDATION.NAME_MIN_LENGTH,
                      message: `Nome deve ter pelo menos ${VALIDATION.NAME_MIN_LENGTH} caracteres`
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      fullWidth
                      error={!!profileErrors.name}
                      helperText={profileErrors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={profileControl}
                  rules={{
                    required: 'Email é obrigatório',
                    pattern: {
                      value: VALIDATION.EMAIL_REGEX,
                      message: 'Email inválido',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      error={!!profileErrors.email}
                      helperText={profileErrors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={profileControl}
                  rules={{
                    required: 'Telefone é obrigatório',
                    pattern: {
                      value: VALIDATION.PHONE_REGEX,
                      message: 'Telefone inválido',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      fullWidth
                      error={!!profileErrors.phone}
                      helperText={profileErrors.phone?.message}
                      placeholder="(00) 00000-0000"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Salvar Alterações
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleAddressSubmit(onAddressSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="zipCode"
                  control={addressControl}
                  rules={{
                    required: 'CEP é obrigatório',
                    pattern: {
                      value: VALIDATION.CEP_REGEX,
                      message: 'CEP inválido',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CEP"
                      fullWidth
                      error={!!addressErrors.zipCode}
                      helperText={addressErrors.zipCode?.message}
                      placeholder="00000-000"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="street"
                  control={addressControl}
                  rules={{ required: 'Rua é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rua"
                      fullWidth
                      error={!!addressErrors.street}
                      helperText={addressErrors.street?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="number"
                  control={addressControl}
                  rules={{ required: 'Número é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Número"
                      fullWidth
                      error={!!addressErrors.number}
                      helperText={addressErrors.number?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="complement"
                  control={addressControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Complemento"
                      fullWidth
                      error={!!addressErrors.complement}
                      helperText={addressErrors.complement?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="neighborhood"
                  control={addressControl}
                  rules={{ required: 'Bairro é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bairro"
                      fullWidth
                      error={!!addressErrors.neighborhood}
                      helperText={addressErrors.neighborhood?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={addressControl}
                  rules={{ required: 'Cidade é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cidade"
                      fullWidth
                      error={!!addressErrors.city}
                      helperText={addressErrors.city?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={addressControl}
                  rules={{ required: 'Estado é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Estado"
                      fullWidth
                      error={!!addressErrors.state}
                      helperText={addressErrors.state?.message}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="" />
                      {brazilianStates.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Salvar Endereço
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  rules={{ required: 'Senha atual é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showCurrentPassword ? 'text' : 'password'}
                      label="Senha Atual"
                      fullWidth
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  rules={{
                    required: 'Nova senha é obrigatória',
                    minLength: {
                      value: VALIDATION.PASSWORD_MIN_LENGTH,
                      message: `A senha deve ter pelo menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showNewPassword ? 'text' : 'password'}
                      label="Nova Senha"
                      fullWidth
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  rules={{
                    required: 'Confirmação de senha é obrigatória',
                    validate: (value) =>
                      value === newPassword || 'As senhas não coincidem',
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirmar Nova Senha"
                      fullWidth
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Alterar Senha
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  )
}
