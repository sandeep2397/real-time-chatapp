import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  useTheme,
} from "@mui/material";
import axios from "axios";
import React, { FC, useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  LoginButton,
  LoginLabel,
  LoginLayoutWrapper,
  StyledForm,
  WelcomeLabel,
} from "./style";

// import { signInWithEmailAndPassword } from 'firebase/auth';
import { ConfirmationResult, signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import io from "socket.io-client";
import { customAuth } from "./firebaseConfig";
import {
  currentSelectedPerson,
  saveContacts,
  saveSocket,
} from "./redux/root_actions";

interface Props {
  children?: null;
}

const socketEndpoint = "http://localhost:4001"; // Your server's URL

const Login: FC<Props> = (props) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = React.useState(false);
  const [pcapsState, passscapsState] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [invalidCreds, setInvalidCreds] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  // const [socket, setSocket] = useSessionStorage<any | undefined | null>(
  //   "socket",
  //   undefined
  // );

  const [username, setUsername] = useState("");
  // const [invalidCreds, setInvalidCreds] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const [state, setState] = useState({
    username: "",
    password: "",
  });

  // useEffect(() => {
  //   return () => {
  //     socket.off("join");
  //   };
  // }, []);

  useEffect(() => {
    if (username) {
      dispatch(currentSelectedPerson({}));
      const newSocket = io(socketEndpoint, {
        // query: { username }, // Pass username in query params or through a connection event
        transports: ["websocket"],
        autoConnect: true,
        reconnectionAttempts: 5, // Number of reconnection attempts
        reconnectionDelay: 1000, // Time between reconnection attempts (ms)
      });

      // Handle connection events
      newSocket.on("connect", () => {
        console.log("Connected to server");
        // let newSocketStr = JSON.stringify({
        //   socket: newSocket,
        // });
        // sessionStorage.setItem("socket", newSocketStr);
        dispatch(saveSocket(newSocket));
        newSocket.emit("join", username); // Emit a join event with the username
      });

      newSocket.on("loadcontacts", (contacts: any) => {
        dispatch(saveContacts(contacts));
        navigate("/home");
      });

      // Cleanup on component unmount
      return () => {
        newSocket.off("join");
        newSocket.off("loadmessages");
        newSocket && newSocket.off("loadcontacts");
      };
    }
  }, [username]);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handlekeypress = (e: KeyboardEvent) => {
    if (e.getModifierState("CapsLock")) {
      passscapsState(true);
    } else {
      passscapsState(false);
    }
  };

  const handleChange = (event: any): void => {
    let name = event?.target.name;
    let value = event?.target.value;
    event.target.setCustomValidity("");
    setInvalidCreds(false);
    setState({
      ...state,
      [name]: value,
    });
  };

  const onFormSubmit = async (event: any) => {
    event.preventDefault();
    const cookies = new Cookies();
    setLoginLoading(true);
    try {
      // const auth = getAuth();
      // await firebase.auth().signInWithEmailAndPassword(state.username, state.password);
      const loginResp: any = await signInWithEmailAndPassword(
        customAuth,
        state.username,
        state.password
      );

      try {
        const saveUser: any = await axios.post(
          `https://real-time-chatapp-sigma.vercel.app/login`,
          {
            userId: state.username || "",
          }
        );

        if (saveUser) {
          let cookieData = {
            jwtToken: loginResp?.user?.accessToken,
          };

          let userInfo = JSON.stringify({
            username: saveUser?.data?.user?.username,
          });

          sessionStorage.setItem("user", userInfo);

          let tempdata = JSON.stringify(cookieData);
          cookies.set("user-info", tempdata, {
            path: "/",
          });

          setUsername(saveUser?.data?.user?.username);

          setLoginLoading(false);
        }
      } catch (error) {
        console.error("Login error:", error);
      }

      // dispatch(captureLoggedInUser(loginResp));
    } catch (error) {
      setLoginLoading(false);
      setInvalidCreds(true);
    }
  };

  //   const handleVerifyOTP = async (otp: any) => {
  //     try {
  //       const credential = PhoneAuthProvider.credential(
  //         confirmationResult?.verificationId || '',
  //         otp
  //       );
  //       await signInWithCredential(customAuth, credential);

  //       //   const token = credential.;
  //       //   const user = credential?.user;
  //       let cookieData = {
  //         jwtToken: `21111`,
  //       };
  //       const cookies = new Cookies();

  //       let tempdata = JSON.stringify(cookieData);
  //       cookies.set('user-info', tempdata, {
  //         path: '/',
  //       });
  //       navigate('/imageupload');
  //       setLoginLoading(false);
  //       dispatch(captureLoggedInUser(credential));
  //       // OTP verification successful, proceed with authenticated user
  //     } catch (error: any) {
  //       if (error.code === 'auth/timeout') {
  //         console.error('OTP confirmation timed out');
  //         // Handle timeout error, e.g., display error message to user
  //       } else {
  //         console.error('Error verifying OTP:', error);
  //         // Handle other errors, e.g., display error message to user
  //       }
  //     }
  //   };

  const confirmOtp = async (otp: string) => {
    try {
      // Confirm OTP
      const credential: any = await confirmationResult?.confirm(otp);
      // console.log('User authenticated successfully:', credential?.user);
      const token = credential?.accessToken;
      const user = credential.user;
      let cookieData = {
        jwtToken: token,
      };
      const cookies = new Cookies();

      let tempdata = JSON.stringify(cookieData);
      cookies.set("user-info", tempdata, {
        path: "/",
      });
      // navigate("/imageupload");
      setLoginLoading(false);
      // dispatch(captureLoggedInUser(credential));

      // return credential;
    } catch (err) {
      setLoginLoading(false);
      console.error("otp error=====>", err);
    }
  };

  return (
    <Box style={{ alignContent: "center", textAlign: "center" }}>
      {loginLoading && (
        <CircularProgress
          color="primary"
          style={{ margin: "160px", zIndex: 5 }}
        />
      )}
      <Card
        style={{
          maxWidth: 345,
          opacity: loginLoading ? 0.3 : 1,
          pointerEvents: loginLoading ? "none" : "auto",
        }}
      >
        <LoginLayoutWrapper
          style={{
            border: "solid 1px #c9c9c9",
            borderRadius: "8px",
            margin: "auto",
            padding: "2px 16px",
            background: "#f3f3ff",
            minHeight: "400px",
            height: "fit-content",
            marginTop: "-16px",
          }}
        >
          <Container
            fixed
            style={{
              textAlign: "center",
              marginTop: "4px",
              marginBottom: "8px",
              height: "90px",
              width: "210px",
            }}
          >
            <img
              src={require("./assets/Logo.png")}
              height="100%"
              width={"100%"}
              alt="Logo"
              style={{
                aspectRatio: 3 / 2,
                objectFit: "contain",
                mixBlendMode: "darken",
              }}
            />
          </Container>
          <Divider style={{ margin: "8px" }} />
          <Container fixed>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "8px",
                marginTop: "0px",
                // borderTop: 'solid 1px #a7a7a7',
              }}
            >
              <LoginLabel style={{ marginTop: "0px" }}>
                {"Login Macchas to chat"}{" "}
              </LoginLabel>{" "}
            </div>
            {invalidCreds && (
              <Alert style={{ marginTop: "8px" }} severity="error">
                {" "}
                {"Invalid Credentials or"}
              </Alert>
            )}
            <StyledForm onSubmit={onFormSubmit}>
              <FormControl fullWidth sx={{ m: 1 }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-username">
                  User Name
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-username"
                  type={"text"}
                  name="username"
                  value={state.username}
                  required={state.username ? false : true}
                  onKeyPress={(event: any) => handlekeypress(event)}
                  onInvalid={(event: any) => {
                    if (state.username) {
                      //do nothing
                    } else {
                      event.target.setCustomValidity("Username is required");
                    }
                  }}
                  onChange={(event: any) => handleChange(event)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FaUser color="primary" />
                    </InputAdornment>
                  }
                  placeholder="Enter user name"
                  label="User Name"
                  // autoFocus
                />
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }} variant="outlined">
                <InputLabel
                  color="primary"
                  htmlFor="outlined-adornment-password"
                >
                  {"Password"}
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  value={state.password}
                  name="password"
                  // ref={register({ required: true, maxLength: 80 })}
                  required={state.password ? false : true}
                  onKeyPress={(event: any) => handlekeypress(event)}
                  onChange={(event: any) => handleChange(event)}
                  onInvalid={(event: any) => {
                    if (state.password) {
                      //do nothing
                    } else {
                      event.target.setCustomValidity("Password is required");
                    }
                  }}
                  placeholder="Enter password"
                  startAdornment={
                    <InputAdornment position="start">
                      <FaLock color="primary" />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>

              <FormControl fullWidth sx={{ m: 1 }} variant="outlined">
                <LoginButton
                  onClick={() => {}}
                  variant="contained"
                  type="submit"
                  startIcon={<MdLogin />}
                  // disabled={state?.username === '' || state?.password === ''}
                >
                  <WelcomeLabel color={theme?.palette?.primary?.contrastText}>
                    {"Login"}
                  </WelcomeLabel>
                </LoginButton>
              </FormControl>
              {/* <Button color="primary" onClick={() => {}}>
                Sign In with Phone Number
              </Button> */}
            </StyledForm>
          </Container>
        </LoginLayoutWrapper>
      </Card>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginLeft: "24px",
          position: "fixed",
          bottom: "20px",
        }}
      >
        {/* <FooterLabel>
            {<FaRegCopyright  color='primary' fontSize={'small'} />}{' '}
          </FooterLabel>
          <FooterLabel>{'2023 All rights reserved by Pivotree'} </FooterLabel> */}
      </div>
    </Box>
  );
};

export default Login;
