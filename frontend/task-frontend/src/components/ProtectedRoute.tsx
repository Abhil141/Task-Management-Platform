import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/useAuth";

type Props = {
  children: ReactElement;
};

export default function ProtectedRoute({ children }: Props) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}
