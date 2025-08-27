import { UserIdDTO } from 'src/interfaces/dto/userId.dto';
import { AuthenticationDTO } from 'src/interfaces/dto/authentication.dto';

export interface AuthenticationEventListener {
    login(authenticationDTO: AuthenticationDTO): Promise<string>;
    logout(): Promise<string>;
}
