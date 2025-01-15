import { useState } from "react";
import { EnterIcon } from "@radix-ui/react-icons";
import {
  Button,
  Tooltip,
  Dialog,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";

function Login(props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip content="Login">
        <Button
          onClick={() => setOpen(true)}
          style={{ position: "fixed", bottom: 20, left: 20, zIndex: 100 }}
          variant="ghost"
        >
          <EnterIcon />
        </Button>
      </Tooltip>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>Log In</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Log in to your account
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                User Name
              </Text>
              <TextField.Root placeholder="Enter your user name" />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Password
              </Text>
              <TextField.Root
                type="Password"
                placeholder="Enter your password"
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button>Login</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

export default Login;
