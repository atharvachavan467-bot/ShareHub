import React, { createContext, useContext, useEffect, useState } from "react";
import api, { extractData } from "@/lib/api";
import { User, UserRole } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<User>;
  register: (formData: FormData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateAvatar: (avatarFile: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>(user?.role || "USER");

  // Keep activeRole in sync when user changes
  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user?.role]);

  // Hydrate user session on app load via GET /users/get_user
  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await api.get("/users/get_user");
      const fetchedUser = extractData<User>(res);
      if (fetchedUser && fetchedUser._id) {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        return fetchedUser;
      }
      return null;
    } catch (err: any) {
      // If 401 or network issue, clear invalid stored session
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email?: string; username?: string; password: string }): Promise<User> => {
    const res = await api.post("/users/login", credentials);
    const data = extractData<{ user: User; accessToken: string; refreshToken: string }>(res);
    
    // In backend user.controller:
    // data might contain { user, accessToken, refreshToken } or be the user directly
    const loggedUser = data?.user || (data as unknown as User);
    const token = data?.accessToken || (res.data?.accessToken) || (res.data?.data?.accessToken);

    if (token) {
      localStorage.setItem("accessToken", token);
    }
    if (loggedUser) {
      setUser(loggedUser);
      setActiveRole(loggedUser.role || "USER");
      localStorage.setItem("user", JSON.stringify(loggedUser));
    }
    toast.success(`Welcome back, ${loggedUser?.fullname || "User"}!`);
    return loggedUser;
  };

  const register = async (formData: FormData): Promise<User> => {
    const res = await api.post("/users/register", formData);
    const createdUser = extractData<User>(res);
    toast.success("Account created successfully! Please sign in.");
    return createdUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/users/logout");
    } catch (err) {
      // Ignore errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.info("You have been signed out.");
    }
  };

  const updateAvatar = async (avatarFile: File): Promise<void> => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const res = await api.post("/users/update-avatar", formData);
    const updatedUser = extractData<User>(res);
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Avatar updated successfully!");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        setActiveRole,
        login,
        register,
        logout,
        refreshUser,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
