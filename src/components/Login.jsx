import { EnterIcon } from "@radix-ui/react-icons";
import { Button, Tooltip } from "@radix-ui/themes";

function Login(props) {
  return (
    <Tooltip content="Login">
      <Button
        style={{ position: "fixed", bottom: 20, left: 20, zIndex: 100 }}
        variant="ghost"
      >
        <EnterIcon />
      </Button>
    </Tooltip>
  );
}

export default Login;
