export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    // add more based on your Laravel user
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  