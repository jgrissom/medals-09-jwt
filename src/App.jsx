import { useEffect, useState, useRef } from "react";
import Country from "./components/Country";
import Login from "./components/Login";
import Logout from "./components/Logout";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
  Tooltip,
  Callout,
  IconButton,
} from "@radix-ui/themes";
import {
  SunIcon,
  MoonIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";
import axios from "axios";
import { getUser } from "./Utils.js";
import { HubConnectionBuilder } from "@microsoft/signalr";

function App() {
  const [appearance, setAppearance] = useState("dark");
  const [notification, setNotification] = useState(null);
  // const apiEndpoint = "https://medalsapi.azurewebsites.net/api/country";
  const apiEndpoint = "https://medalsapi.azurewebsites.net/jwtapi/country";
  const hubEndpoint = "https://medalsapi.azurewebsites.net/medalsHub";
  const userEndpoint = "https://jwtswagger.azurewebsites.net/api/user/login";
  const [connection, setConnection] = useState(null);
  const [countries, setCountries] = useState([]);
  const [user, setUser] = useState({
    name: null,
    authenticated: false,
    canPost: false,
    canPatch: false,
    canDelete: false,
  });
  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);
  const latestCountries = useRef(null);
  // latestCountries is a ref variable to countries (state)
  // this is needed to access state variable in useEffect w/o dependency
  latestCountries.current = countries;

  useEffect(() => {
    // initial data loaded here
    async function fetchCountries() {
      try {
        const { data: fetchedCountries } = await axios.get(apiEndpoint);
        // we need to save the original medal count values in state
        let newCountries = [];
        fetchedCountries.forEach((country) => {
          let newCountry = {
            id: country.id,
            name: country.name,
          };
          medals.current.forEach((medal) => {
            const count = country[medal.name];
            // page_value is what is displayed on the web page
            // saved_value is what is saved to the database
            newCountry[medal.name] = { page_value: count, saved_value: count };
          });
          newCountries.push(newCountry);
        });
        setCountries(newCountries);
      } catch {
        setNotification({
          message: "Unable to load countries. Please try again.",
          color: "red",
        });
      }
    }
    fetchCountries();

    const encoded = localStorage.getItem("token");
    // check for existing token
    encoded && setUser(getUser(encoded));

    // signalR
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubEndpoint)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          connection.on("ReceiveAddMessage", (country) => {
            let newCountry = {
              id: country.id,
              name: country.name,
            };
            medals.current.forEach((medal) => {
              const count = country[medal.name];
              newCountry[medal.name] = {
                page_value: count,
                saved_value: count,
              };
            });
            // we need to use a reference to countries array here
            // since this useEffect has no dependeny on countries array - it is not in scope
            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.concat(newCountry);
            setCountries(mutableCountries);
          });

          connection.on("ReceiveDeleteMessage", (id) => {
            let mutableCountries = [...latestCountries.current];
            mutableCountries = mutableCountries.filter((c) => c.id !== id);
            setCountries(mutableCountries);
          });

          connection.on("ReceivePatchMessage", (country) => {
            let updatedCountry = {
              id: country.id,
              name: country.name,
            };
            medals.current.forEach((medal) => {
              const count = country[medal.name];
              updatedCountry[medal.name] = {
                page_value: count,
                saved_value: count,
              };
            });
            let mutableCountries = [...latestCountries.current];
            const idx = mutableCountries.findIndex((c) => c.id === country.id);
            mutableCountries[idx] = updatedCountry;

            setCountries(mutableCountries);
          });
        })
        .catch(() =>
          setNotification({
            message: "Live updates are unavailable. Please refresh to reconnect.",
            color: "red",
          })
        );
    }
    // useEffect is dependent on changes to connection
  }, [connection]);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }
  async function handleAdd(name) {
    try {
      await axios.post(
        apiEndpoint,
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (ex) {
      if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {
        setNotification({
          message: "You are not authorized to complete this request.",
          color: "red",
        });
      } else {
        setNotification({
          message: "Unable to add country. Please try again.",
          color: "red",
        });
      }
    }
  }
  async function handleDelete(countryId) {
    const originalCountries = countries;
    setCountries(countries.filter((c) => c.id !== countryId));
    try {
      await axios.delete(`${apiEndpoint}/${countryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        setNotification({
          message: "This country was already deleted.",
          color: "blue",
        });
      } else {
        setCountries(originalCountries);
        if (
          ex.response &&
          (ex.response.status === 401 || ex.response.status === 403)
        ) {
          setNotification({
            message: "You are not authorized to complete this request.",
            color: "red",
          });
        } else {
          setNotification({
            message: "Unable to delete country. Please try again.",
            color: "red",
          });
        }
      }
    }
  }
  function handleIncrement(countryId, medalName) {
    handleUpdate(countryId, medalName, 1);
  }
  function handleDecrement(countryId, medalName) {
    handleUpdate(countryId, medalName, -1);
  }
  function handleUpdate(countryId, medalName, factor) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName].page_value += 1 * factor;
    setCountries(mutableCountries);
  }
  async function handleSave(countryId) {
    const originalCountries = countries;

    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    const country = mutableCountries[idx];
    let jsonPatch = [];
    medals.current.forEach((medal) => {
      if (country[medal.name].page_value !== country[medal.name].saved_value) {
        jsonPatch.push({
          op: "replace",
          path: medal.name,
          value: country[medal.name].page_value,
        });
        country[medal.name].saved_value = country[medal.name].page_value;
      }
    });
    // update state
    setCountries(mutableCountries);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        setNotification({
          message: "This country was already deleted.",
          color: "blue",
        });
      } else if (
        ex.response &&
        (ex.response.status === 401 || ex.response.status === 403)
      ) {
        setNotification({
          message: "You are not authorized to complete this request.",
          color: "red",
        });
        // to simplify, I am reloading the page to restore "saved" values
        setTimeout(() => window.location.reload(false), 1200);
      } else {
        setNotification({
          message: "An error occurred while updating. Please try again.",
          color: "red",
        });
        setCountries(originalCountries);
      }
    }
  }
  function handleReset(countryId) {
    // to reset, make page value the same as the saved value
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    const country = mutableCountries[idx];
    medals.current.forEach((medal) => {
      country[medal.name].page_value = country[medal.name].saved_value;
    });
    setCountries(mutableCountries);
  }
  async function handleLogin(username, password) {
    try {
      const resp = await axios.post(userEndpoint, {
        username: username,
        password: password,
      });
      const encoded = resp.data.token;
      const authenticatedUser = getUser(encoded);
      localStorage.setItem("token", encoded);
      setUser(authenticatedUser);
    } catch (ex) {
      if (ex.response) {
        setNotification({
          message: `Login rejected by the server (HTTP ${ex.response.status}). Check the username and password.`,
          color: "red",
        });
      } else if (ex.request) {
        setNotification({
          message: "Could not reach the login service. Check the connection and try again.",
          color: "red",
        });
      } else {
        setNotification({
          message: "The login response did not contain a valid token.",
          color: "red",
        });
      }
    }
  }
  function handleLogout() {
    localStorage.removeItem("token");
    setUser({
      name: null,
      authenticated: false,
      canPost: false,
      canPatch: false,
      canDelete: false,
    });
  }
  function getAllMedalsTotal() {
    let sum = 0;
    // use medal count displayed in the web page for medal count totals
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + b[medal.name].page_value, 0);
    });
    return sum;
  }

  return (
    <Theme appearance={appearance}>
      {notification && (
        <Callout.Root
          className="app-notification"
          color={notification.color}
          role="alert"
        >
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text className="app-notification-text">
            {notification.message}
          </Callout.Text>
          <Tooltip content="Dismiss message">
            <IconButton
              variant="ghost"
              color={notification.color}
              aria-label="Dismiss message"
              onClick={() => setNotification(null)}
            >
              <Cross2Icon />
            </IconButton>
          </Tooltip>
        </Callout.Root>
      )}
      <Tooltip content={`Switch to ${appearance === "dark" ? "light" : "dark"} theme`}>
        <Button
          onClick={toggleAppearance}
          aria-label={`Switch to ${appearance === "dark" ? "light" : "dark"} theme`}
          style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
          variant="ghost"
        >
          {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Tooltip>
      {user.authenticated ? (
        <Logout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        {user.canPost && <NewCountry onAdd={handleAdd} />}
      </Flex>
      <Container className="bg"></Container>
      <Grid pt="2" gap="2" className="grid-container">
        {countries
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((country) => (
            <Country
              key={country.id}
              country={country}
              medals={medals.current}
              canDelete={user.canDelete}
              canPatch={user.canPatch}
              onDelete={handleDelete}
              onSave={handleSave}
              onReset={handleReset}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>
    </Theme>
  );
}

export default App;
