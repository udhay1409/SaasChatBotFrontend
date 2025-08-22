export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
  isVerified: boolean;
  // Optional properties for extended functionality
  userType?: string;
  organizationId?: string;
  chatbotsLimit?: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}