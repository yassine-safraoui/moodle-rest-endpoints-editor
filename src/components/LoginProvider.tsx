import { useAuth0 } from "@auth0/auth0-react";
import { LoadingSpinner } from "./ui/Spinner";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";

export default function LoginProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loginWithRedirect } = useAuth0();
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <AuthLoading>
        <div className="flex h-full w-full items-center justify-center gap-3 text-lg">
          <LoadingSpinner />
          Logging in...
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex h-full w-full items-center justify-center gap-3 text-lg">
          <Button onClick={() => loginWithRedirect()}>Login</Button>
        </div>
      </Unauthenticated>
    </>
  );
}
