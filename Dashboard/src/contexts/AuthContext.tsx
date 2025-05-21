import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { getBaseUrl } from "@/lib/api";

interface User {
  id: string;
  firstName: string;
  role: string;
  avatar?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    axios
      .get("/api/user/getUserProfile", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  // Check if the user is authenticated when the component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Authentication initialization error:", error);
      }
    };

    initialize();
  }, []);

  // Function to check if the user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    try {
      const res = await axios.get(`${getBaseUrl()}/api/user/me`, {
        withCredentials: true, // ⭐⭐ สำคัญ!
      });
      const user = res.data.user;

      setUser({
        id: user._id,
        firstName: user.firstName,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
      });

      return true;
    } catch (error) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to log in
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${getBaseUrl()}/api/user/loginUser`,
        { email, password },
        { withCredentials: true } // ⭐⭐ สำคัญ!
      );

      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error("Failed to fetch user profile");
      }

      const user = res.data.user;

      if (user.role !== "admin") {
        throw new Error("Access denied: Not an admin");
      }

      setUser({
        id: user._id,
        firstName: user.firstName,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
      });

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.firstName}!`,
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to log out
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await axios.post(
        `${getBaseUrl()}/api/user/logoutUser`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      toast({
        title: "Logout Successful",
        description: "You have been logged out.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole = "admin" }) => {
  const { user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!loading && !user) {
        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          toast({
            title: "Authentication Required",
            description: "Please login to access this page.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        if (requiredRole && user?.role !== requiredRole) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to access this page.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
      }
      setIsChecking(false);
    };

    verifyAccess();
  }, [user, loading, navigate, checkAuth, requiredRole]);

  if (loading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
