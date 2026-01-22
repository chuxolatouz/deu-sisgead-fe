import { useCallback, useState } from "react";
import { Button, Card, styled } from "@mui/material";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import { H1 } from "components/Typography";
import BazaarTextField from "components/BazaarTextField";
import BazaarImage from "components/BazaarImage";
import EyeToggleButton from "./EyeToggleButton";
import { useApi } from "contexts/AxiosContext";
import { sendLoginNotification } from "utils/emailService";


const fbStyle = {
  background: "#3B5998",
  color: "white",
};
const googleStyle = {
  background: "#4285F4",
  color: "white",
};
export const Wrapper = styled(({ children, passwordVisibility, ...rest }) => (
  <Card {...rest}>{children}</Card>
))(({ theme, passwordVisibility }) => ({
  width: 500,
  padding: "2rem 3rem",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  ".passwordEye": {
    color: passwordVisibility
      ? theme.palette.grey[600]
      : theme.palette.grey[400],
  },
  ".facebookButton": {
    marginBottom: 10,
    ...fbStyle,
    "&:hover": fbStyle,
  },
  ".googleButton": {
    ...googleStyle,
    "&:hover": googleStyle,
  },
  ".agreement": {
    marginTop: 12,
    marginBottom: 24,
  },
}));

const Login = () => {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisibility((visible) => !visible);
  }, []);

  const { api } = useApi();
  const { enqueueSnackbar } = useSnackbar();
  
  const handleFormSubmit = (values) => {
    api.post('/login', values).then((response) => {
      const userData = {
        nombre: response.data.nombre,
        role: response.data.role,
        email: response.data.email
      };
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Enviar notificación de login (silencioso, no bloquea la navegación)
      sendLoginNotification(api, userData, true).catch(() => {
        // Error silencioso, no afecta el flujo de login
      });
      
      window.location.href = '/admin/products';
    }).catch((error) => {
      if (error.response) {
        enqueueSnackbar(error.response.data.message, { variant: 'error'});
      } else {
        enqueueSnackbar(error.message, { variant: 'error'});
      }
    });
  };



  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      onSubmit: handleFormSubmit,
      validationSchema: formSchema,
    });
  return (
    <Wrapper elevation={3} passwordVisibility={passwordVisibility}>
      <form onSubmit={handleSubmit}>
        <BazaarImage
          src="/assets/images/logo-enii.png"
          sx={{
            m: "auto",
            width: "-webkit-fill-available"
          }}
        />

        <H1 textAlign="center" mt={1} mb={4} fontSize={16}>
          Bienvenidos a ENII
        </H1>

        <BazaarTextField
          mb={1.5}
          fullWidth
          name="email"
          size="small"
          type="email"
          variant="outlined"
          onBlur={handleBlur}
          value={values.email}
          onChange={handleChange}
          label="Email"
          placeholder="example@enii.com.ve"
          error={!!touched.email && !!errors.email}
          helperText={touched.email && errors.email}
        />

        <BazaarTextField
          mb={2}
          fullWidth
          size="small"
          name="password"
          label="Password"
          autoComplete="on"
          variant="outlined"
          onBlur={handleBlur}
          onChange={handleChange}
          value={values.password}
          placeholder="*********"
          type={passwordVisibility ? "text" : "password"}
          error={!!touched.password && !!errors.password}
          helperText={touched.password && errors.password}
          InputProps={{
            endAdornment: (
              <EyeToggleButton
                show={passwordVisibility}
                click={togglePasswordVisibility}
              />
            ),
          }}
        />

        <Button
          fullWidth
          type="submit"
          color="primary"
          variant="contained"
          sx={{
            height: 44,
          }}
        >
          Login
        </Button>
      </form>
      
    </Wrapper>
  );
};
const initialValues = {
  email: "",
  password: "",
};
const formSchema = yup.object().shape({
  password: yup.string().required("Password is required"),
  email: yup.string().email("invalid email").required("Email is required"),
});
export default Login;
