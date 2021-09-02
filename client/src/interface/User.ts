export interface User {
  email: string;
  boards: string[];
  _id: string;
}

export interface SearchUsersApiData {
  users?: User[];
  error?: { message: string };
}
