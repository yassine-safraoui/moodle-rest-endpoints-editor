"use client";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import LoginProvider from "./LoginProvider";
import { Auth0Provider } from "@auth0/auth0-react";
import { ConvexReactClient } from "convex/react";

export const convexClient = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth0Provider
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      authorizationParams={{
        redirect_uri:
          typeof window === "undefined" ? undefined : window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <ConvexProviderWithAuth0 client={convexClient}>
        <LoginProvider>{children}</LoginProvider>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
