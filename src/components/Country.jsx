// import Medal from "./Medal";
import { Box, Table, Flex, Badge, Button } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

function Country(props) {
  function getMedalsTotal() {
    let sum = 0;
    props.medals.forEach((medal) => {
      sum += props.country[medal.name];
    });
    return sum;
  }

  return (
    <Box width="300px">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell colSpan="2">
              <Flex justify="between">
                <span>
                  {props.country.name}
                  <Badge variant="outline" ml="2">
                    {getMedalsTotal(props.country, props.medals)}
                  </Badge>
                </span>
                <Button color="red" variant="ghost" size="1">
                  <TrashIcon onClick={() => props.onDelete(props.country.id)} />
                </Button>
              </Flex>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
      </Table.Root>
    </Box>
  );
}

export default Country;
