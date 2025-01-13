import { useState, useRef } from "react";
// import Country from "./components/Country";
import { Theme, Flex, Heading, Badge } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./App.css";
// import NewCountry from "./components/NewCountry";

function App() {
  const [countries, setCountries] = useState([
    { id: 1, name: "United States", gold: 2, silver: 2, bronze: 3 },
    { id: 2, name: "China", gold: 3, silver: 1, bronze: 0 },
    { id: 3, name: "France", gold: 0, silver: 2, bronze: 2 },
  ]);
  const medals = useRef([
    { id: 1, name: "gold" },
    { id: 2, name: "silver" },
    { id: 3, name: "bronze" },
  ]);

  function handleAdd(name) {
    console.log(`add country: ${name}`);
    setCountries(
      [...countries].concat({
        id:
          countries.length === 0
            ? 1
            : Math.max(...countries.map((country) => country.id)) + 1,
        name: name,
        gold: 0,
        silver: 0,
        bronze: 0,
      })
    );
  }
  function handleDelete(id) {
    console.log(`delete country: ${id}`);
    setCountries(countries.filter((c) => c.id !== id));
  }
  function handleIncrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName] += 1;
    setCountries(mutableCountries);
  }
  function handleDecrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName] -= 1;
    setCountries(mutableCountries);
  }
  function getAllMedalsTotal() {
    let sum = 0;
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + b[medal.name], 0);
    });
    return sum;
  }

  return (
    <Theme appearance="dark">
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
      </Flex>
    </Theme>
  );
}

export default App;
