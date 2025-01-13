import { fetchAuthSession } from 'aws-amplify/auth';

class AuthService {

  async getJwtToken() {
    try {
      const session = await fetchAuthSession();
      console.log(session);
      const jwtToken = session.tokens?.idToken?.toString();
      return jwtToken;
    } catch (error) {
      console.error('Error retrieving JWT token:', error);
    }
  }

  getAuthHeaders = async (): Promise<{ Authorization: string }> => {
    const token = await this.getJwtToken();
    if (!token) {
      throw new Error('Failed to retrieve JWT token');
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };
};

export default AuthService; 